import { Settings } from '../../../../../domain/common/settings';
import { QrCodePix } from 'qrcode-pix';
import {
  GeneratePixPort,
  StaticPix,
} from '../../../../../domain/order/ports/generate-pix.port';

export class GeneratePixQrCodeAdapter implements GeneratePixPort {
  static instance: GeneratePixQrCodeAdapter;

  static getInstance(settings: Settings) {
    if (!GeneratePixQrCodeAdapter.instance) {
      GeneratePixQrCodeAdapter.instance = new GeneratePixQrCodeAdapter(
        settings,
      );
    }

    return GeneratePixQrCodeAdapter.instance;
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
