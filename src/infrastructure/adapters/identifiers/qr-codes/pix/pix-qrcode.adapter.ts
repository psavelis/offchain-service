import {type Settings} from '../../../../../domain/common/settings';
import {QrCodePix} from 'qrcode-pix';
import {
  type GeneratePixPort,
  type StaticPix,
} from '../../../../../domain/order/ports/generate-pix.port';

export class PixQrCodeAdapter implements GeneratePixPort {
  static instance: PixQrCodeAdapter;

  static getInstance(settings: Settings) {
    if (!PixQrCodeAdapter.instance) {
      PixQrCodeAdapter.instance = new PixQrCodeAdapter(settings);
    }

    return PixQrCodeAdapter.instance;
  }

  private constructor(readonly settings: Settings) {}

  async generate(
    value: number,
    endToEndId: string,
    message: string,
  ): Promise<StaticPix> {
    const qrCodePix = QrCodePix({
      version: '01',
      key: this.settings.pix.key,
      name: this.settings.pix.name,
      city: this.settings.pix.city,
      transactionId: endToEndId,
      message,
      value,
    });

    const payload = qrCodePix.payload();
    const base64 = await qrCodePix.base64();

    return {
      payload,
      base64,
    };
  }
}
