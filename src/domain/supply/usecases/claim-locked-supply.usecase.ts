import { EncryptionPort } from '../../common/ports/encryption.port';
import { LoggablePort } from '../../common/ports/loggable.port';
import {
  SignaturePort,
  SignatureResult,
} from '../../common/ports/signature.port';
import { Settings } from '../../common/settings';
import { Id } from '../../common/uuid';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { FetchableOrderPort } from '../../order/ports/fetchable-order.port';
import { ClaimLockedSupplyDto } from '../dtos/claim-locked-supply.dto';
import { ClaimLockedSupplyInteractor } from '../interactors/claim-locked-supply.interactor';
import {
  cryptoWalletRegEx,
  formatDecimals,
  hideEmailPartially,
} from '../../common/util';
import { DelegateClaimPort } from '../ports/delegate-claim.port';
import { MinimalSignedClaim, SignedClaim } from '../dtos/signed-claim.dto';
import { Challenge } from '../entities/challenge.entity';
import { PersistableChallengePort } from '../ports/persistable-challenge.port';
import { CreateOrderTransitionInteractor } from '../../order/interactors/create-order-status-transition.interactor';
import { FetchableChallengePort } from '../ports/fetchable-challenge.port';
import { Answer } from '../entities/answer.entity';
import { PersistableAnswerPort } from '../ports/persistable-answer.port';
import { MailerPort } from '../../common/ports/mailer.port';
import claimOtpTemplate from '../../supply/mails/claim-otp.template';
import { Chain } from '../../common/entities/chain.entity';

const DEFAULT_KNN_TRUNCATE_OPTIONS = {
  truncateDecimals: 8,
};

const THREE_DAYS_EXPIRATION = 1000 * 60 * 60 * 24 * 3;

const IP_BAN_THRESHOLD = 15;

const errorAttemptsByIP: Record<string, number> = {};
const banlistByIP: Record<string, boolean> = {}; // TODO: persistir permanentemente

export class ClaimLockedSupplyUseCase implements ClaimLockedSupplyInteractor {
  constructor(
    readonly settings: Settings,
    readonly logger: LoggablePort,
    readonly signaturePort: SignaturePort,
    readonly fetchableOrderPort: FetchableOrderPort,
    readonly encryptionPort: EncryptionPort,
    readonly delegateClaimPort: DelegateClaimPort,
    readonly persistableChallengePort: PersistableChallengePort,
    readonly createOrderTransitionInteractor: CreateOrderTransitionInteractor,
    readonly fetchableChallengePort: FetchableChallengePort,
    readonly persistableAnswerPort: PersistableAnswerPort,
    readonly mailerPort: MailerPort,
  ) {}

  private validateEmailAddress(email: string) {
    if (
      !email.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g,
      )
    ) {
      throw new Error('invalid email address');
    }
  }

  private validateCryptoWallet(cw: string) {
    if (!cw.match(cryptoWalletRegEx)) {
      throw new Error('invalid wallet address');
    }
  }

  async executeChallenge(entry: ClaimLockedSupplyDto) {
    if (banlistByIP[entry.clientIp]) {
      this.logger.warning(
        `[skip] banned user ${entry.clientIp} (attempted: ${hideEmailPartially(
          entry.emailAddress,
        )})`,
      );

      return;
    }

    const lowerCaseEmailAddress = entry.emailAddress.toLowerCase();

    this.validateEmailAddress(lowerCaseEmailAddress);

    const orders =
      await this.fetchableOrderPort.fetchLockedAndNotClaimedInStatus(
        OrderStatus.Locked,
        OrderStatus.Challenged,
        OrderStatus.Owned,
      );

    if (!orders || !Object.keys(orders).length) {
      this.reportFailure(entry);

      return;
    }

    const userOrders = await this.filterByEmail(
      lowerCaseEmailAddress,
      orders,
      entry,
    );

    if (!userOrders?.length) {
      this.reportFailure(entry);

      return;
    }

    const oneTimePassword = Id.createOTP();
    const verificationHash = this.generateVerificationHash(
      lowerCaseEmailAddress,
      oneTimePassword,
    );
    const deactivationHash = this.generateDeactivationHash(
      lowerCaseEmailAddress,
    );

    const currentDate = new Date();

    let challenge = new Challenge({
      identifierOrderId: userOrders[0].getId(),
      clientIp: entry.clientIp,
      clientAgent: entry.clientAgent,
      verificationHash,
      deactivationHash,
      expiresAt: new Date(currentDate.getTime() + THREE_DAYS_EXPIRATION),
      createdAt: currentDate,
    });

    await this.persistableChallengePort.deactivate(deactivationHash);

    challenge = await this.persistableChallengePort.create(challenge);

    for (const order of userOrders) {
      order.setStatus(OrderStatus.Challenged);

      await this.createOrderTransitionInteractor.execute(order, {
        reason: `${entry.clientIp} challenged with #${challenge.getId()}`,
      });
    }
    const html = this.mailerPort.parserTemplate(claimOtpTemplate, {
      otp: oneTimePassword,
    });

    return this.mailerPort.sendMail({
      to: lowerCaseEmailAddress,
      subject: 'Resgate seus tokens KNN utilizando o código de verificação.',
      html,
    });
  }

  private generateDeactivationHash(lowerCaseEmailAddress: string) {
    return this.signaturePort.hash(
      `d=${lowerCaseEmailAddress}:${this.settings.sha3.identitySecret}`,
    );
  }

  private generateVerificationHash(
    lowerCaseEmailAddress: string,
    oneTimePassword: string,
  ) {
    return this.signaturePort.hash(
      `v=${lowerCaseEmailAddress}:${oneTimePassword}:${this.settings.sha3.identitySecret}`,
    );
  }

  async validateAnswer(
    entry: ClaimLockedSupplyDto,
  ): Promise<MinimalSignedClaim[]> {
    if (banlistByIP[entry.clientIp]) {
      this.logger.warning(
        `[skip] banned user ${entry.clientIp} (attempted: ${hideEmailPartially(
          entry.emailAddress,
        )})`,
      );

      return [];
    }

    const lowerCaseEmailAddress = entry.emailAddress.toLowerCase();
    this.validateEmailAddress(lowerCaseEmailAddress);
    this.validateCryptoWallet(entry.cryptoWallet);
    this.validateOTP(entry.code);

    const orders =
      await this.fetchableOrderPort.fetchLockedAndNotClaimedInStatus(
        OrderStatus.Challenged,
      );

    if (!orders || !Object.keys(orders).length) {
      this.reportFailure(entry);

      return [];
    }

    const userOrders = await this.filterByEmail(
      lowerCaseEmailAddress,
      orders,
      entry,
    );

    if (!userOrders?.length) {
      this.reportFailure(entry);

      return [];
    }

    const signedOrders = await this.trySignOrders(entry, userOrders);

    if (!signedOrders?.length) {
      this.reportFailure(entry);

      return [];
    }

    const verificationHash = this.generateVerificationHash(
      lowerCaseEmailAddress,
      entry.code!,
    );

    const currentDate = new Date();
    const challenge = await this.fetchableChallengePort.fetch(verificationHash);

    if (!challenge || challenge.getExpiresAt() < currentDate) {
      this.reportFailure(entry);

      return [];
    }

    let answer = new Answer({
      identifierOrderId: signedOrders[0].order.getId(),
      clientIp: entry.clientIp,
      clientAgent: entry.clientAgent,
      verificationHash,
      createdAt: currentDate,
      challengeId: challenge.getId(),
    });

    answer = await this.persistableAnswerPort.create(answer);

    for (const { order } of signedOrders) {
      order.setStatus(OrderStatus.Owned);

      await this.createOrderTransitionInteractor.execute(order, {
        reason: `Challenge ${challenge.getId()} answered at ${
          entry.clientIp
        } with #${answer.getId()}`,
      });
    }

    return signedOrders.map(({ order, signature }) => ({
      order: this.parseDto(order),
      signature,
    }));
  }

  validateOTP(code: string) {
    if (code.includes('0') || code.includes('O') || code.length !== 6) {
      throw new Error('Invalid OTP');
    }
  }

  private async trySignOrders(
    entry: ClaimLockedSupplyDto,
    userOrders: Order[],
  ) {
    const signedOrders: Array<SignedClaim> = [];

    for (const order of userOrders) {
      const signature: SignatureResult | null = await this.delegateClaimPort
        .delegateClaimLocked(entry, order)
        .catch((err) => {
          this.logger.error(
            err,
            `[signing] delegate-claim failed for OrderId=${order.getId()}`,
            {
              ...entry,
              emailAddres: hideEmailPartially(entry.emailAddress),
            },
          );

          return null;
        });

      if (!signature) {
        continue;
      }

      const succeeded: boolean = await this.delegateClaimPort
        .estimateClaimLocked(entry, order, signature)
        .then(() => true)
        .catch((err) => {
          this.logger.error(
            err,
            `[estimate] delegate-claim failed for OrderId=${order.getId()}`,
            {
              ...entry,
              emailAddres: hideEmailPartially(entry.emailAddress),
            },
          );

          return false;
        });

      if (!succeeded) {
        continue;
      }

      signedOrders.push({
        order,
        signature,
      });
    }

    return signedOrders;
  }

  private async reportFailure(entry: ClaimLockedSupplyDto): Promise<void> {
    this.logger.warning(
      `[sec-warning] Attempt failure: ${JSON.stringify({
        ...entry,
        emailAddres: hideEmailPartially(entry.emailAddress),
      })}`,
    );

    errorAttemptsByIP[entry.clientIp] =
      (errorAttemptsByIP[entry.clientIp] || 0) + 1;

    if (errorAttemptsByIP[entry.clientIp] > IP_BAN_THRESHOLD) {
      banlistByIP[entry.clientIp] = true;

      const deactivationHash = this.generateDeactivationHash(
        entry.emailAddress.toLowerCase(),
      );

      await this.persistableChallengePort.deactivate(deactivationHash);

      this.logger.warning(
        `[sec-warning] user ${entry.clientIp}@${
          entry.clientAgent
        } permanently banned (#${
          Object.keys(banlistByIP).length
        }) due to ${IP_BAN_THRESHOLD} failed attempts. ${JSON.stringify({
          ...entry,
          emailAddres: hideEmailPartially(entry.emailAddress),
        })}`,
      );
    }
  }

  private async filterByEmail(
    emailAddress: string,
    orders: Record<string, Order>,
    request: ClaimLockedSupplyDto,
  ): Promise<Order[]> {
    if (!Object.keys(orders)?.length) {
      return [];
    }

    const filtered: Array<Order> = [];

    for (const [orderId, order] of Object.entries(orders)) {
      const notEmailIdentifier = order.getIdentifierType() !== 'EA';

      if (notEmailIdentifier) {
        continue;
      }

      const decryptedIdentifier = await this.encryptionPort.decrypt(
        order.getUserIdentifier(),
        orderId,
        this.settings.cbc.key,
      );

      const incorrectEmailAddress =
        decryptedIdentifier.toLowerCase() !== emailAddress;

      if (incorrectEmailAddress) {
        continue;
      }

      const notPaid =
        !order.hasPayments() ||
        !order.getPaymentProviderId() ||
        !(Number(order.getPaymentSequence()) >= 1);

      const alreadyClaimed =
        order.getClaimTransactionHash() || order.inStatus(OrderStatus.Claimed);

      const notLocked = !order.getLockTransactionHash();

      if (notPaid || notLocked || alreadyClaimed) {
        continue;
      }

      const amountOfTokens = order.getAmountOfTokens();

      const totalKnnExpected = Number(
        formatDecimals(
          amountOfTokens.unassignedNumber,
          amountOfTokens.decimals,
          DEFAULT_KNN_TRUNCATE_OPTIONS,
        ),
      );

      const totalKnnStored = Number(order.getTotalKnn());

      const valueNotMatched =
        totalKnnStored > totalKnnExpected + 1 ||
        totalKnnStored < totalKnnExpected - 1;

      if (valueNotMatched) {
        this.logger.warning(
          `[sec-warning] inconsistent amount of stored tokens, expected '${totalKnnExpected}' but got '${order.getTotalKnn()}'. (OrderId=${orderId})`,
          JSON.stringify(request),
        );

        continue;
      }

      const lockNotMatched =
        order.getTotalLockedUint256() !== amountOfTokens.unassignedNumber;

      if (lockNotMatched) {
        this.logger.warning(
          `[sec-warning] inconsistent amount of locked tokens, expected '${
            amountOfTokens.unassignedNumber
          }' but got '${order.getTotalLockedUint256()}'. (OrderId=${orderId})`,
          JSON.stringify(request),
        );

        continue;
      }

      // TODO: [SECURITY-WARN] verificar onchain se o amount do lock confere (OPCIONAL: validação order x ONCHAIN)

      filtered.push(order);
    }

    return filtered;
  }

  private parseDto(entity: Order) {
    return {
      orderId: entity.getId(),
      status: entity.getStatus(),
      statusDescription: entity.getStatusDescription(),
      total: entity.getTotal(),
      amountOfTokens: entity.getAmountOfTokens(),
      lockTransactionHash: entity.getLockTransactionHash(),
      contractAddress: entity.getContractAddress(),
      chainId: entity.getChainId(),
      reference: entity.getPaymentSequence(),
      createdAt: entity.getCreatedAt(),
    };
  }
}
