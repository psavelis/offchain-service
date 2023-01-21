export default `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Sua reserva de KNN foi confirmada!</title>
</head>
<body
    style="margin: 0 auto; padding: 0; width: 100%; font-family: Poppins, Arial, Helvetica, sans-serif;background-color: #091A04;">
    <div>
        <!-- HEADER -->
        <div style="max-width:800px; margin:auto;">
            <table style="max-width: 600px; margin: auto; width: 100%;padding: 48px 0px 56px 0px;">
                <tr>
                    <td style="text-align: center;">
                        <img src="https://dapp.kannacoin.io/assets/mails/knn-green.png" alt="Logo Kanna" style="width: 180px;">
                    </td>
                </tr>
            </table>
            <!-- CONTENT -->
            <table style="max-width: 600px; margin: auto; width: 100%;padding:0px 0px 48px 0px;color: #E7ECE6;">
                <tr>
                    <td>
                        <h1 style="font-weight: 600; font-size: 30px; line-height: 40px;margin: 0;color: #95DE81;">Você
                            reservou seus tokens KNN e já faz parte da comunidade Kanna.</h1>
                        <p style="font-weight: 200; font-size: 16px;  line-height: 28px;margin: 16px 0px 0px 0px;">Ao
                            adquirir tokens Kanna, você contribui com a comunidade que vai utilizar a tecnologia da
                            Cannabis para gerar impacto ambiental e social.</p>
                    </td>
                </tr>
            </table>
            <!-- TABLE / RECEIPT -->
            <table
                style="max-width: 500px; margin: 0 auto; width: 100%;background-color: #13250E; padding: 16px 40px 8px 40px;border-radius: 8px 8px 0px 0px;">
                <tr>
                    <td>
                        <h2
                            style="font-weight: 400; font-size: 14px;line-height: 20px;color: #2BBD04;background-color: #091A04;border-radius: 10px;padding: 0px 12px;width: fit-content; text-align: center;">
                            Reserva nº: {{orderNumber}}</h2>
                    </td>
                </tr>
            </table>
            <table
                style="max-width: 500px; margin: 0 auto; width: 100%;background-color: #13250E; padding: 8px 40px 24px 40px;">
                <tr>
                    <td style="width:40%;">
                        <p
                            style="font-style: normal;font-weight: 400;font-size: 14px;line-height: 32px;color: #FAFAFA;margin: 0;">
                            Total de tokens</p>
                    </td>
                    <td style="width:60%;text-align:right;">
                        <p
                            style="font-style: normal;font-weight: 600; font-size: 16px; line-height: 32px;margin: 0;color: #2BBD04;">
                            {{knnAmount}} KNN</p>
                    </td>
                </tr>
                <tr>
                    <td style="width:40%;">
                        <p
                            style="font-style: normal;font-weight: 400;font-size: 14px;line-height: 32px;color: #FAFAFA;margin: 0;">
                            Valor da reserva</p>
                    </td>
                    <td style="width:60%;text-align:right;">
                        <p
                            style="font-style: normal;font-weight: 600; font-size: 16px; line-height: 32px;margin: 0;color: #2BBD04;">
                            {{brlAmount}}</p>
                    </td>
                </tr>
                <tr>
                    <td style="width:40%;">
                        <p
                            style="font-style: normal;font-weight: 400;font-size: 14px;line-height: 32px;color: #FAFAFA;margin: 0;">
                            Data da reserva</p>
                    </td>
                    <td style="width:60%;text-align:right;">
                        <p
                            style="font-style: normal;font-weight: 600; font-size: 16px; line-height: 32px;margin: 0;color: #2BBD04;">
                            {{date}}</p>
                    </td>
                </tr>
            </table>
            <table
                style="max-width: 500px; margin: 0 auto; width: 100%;background-color: #13250E; padding: 0px 40px 8px 40px;border-radius: 0px 0px 8px 8px;">
                <tr>
                    <td>
                        <p
                            style="font-weight: 400; font-size: 12px;line-height: 20px;color: #95DE81;padding: 0px 12px; text-align: left;">
                            Você também pode verificar o registro de sua reserva de toknes KNN no <a
                                href="{{transaction}}" target="_blank"
                                style="text-decoration:underline;color:#95DE81">Etherscan</a>.</p>
                    </td>
                </tr>
            </table>
            <!-- CONTACT -->
            <table
                style="max-width: 600px; margin: auto; width: 100%;padding: 72px 0px 0px 0px; color: #FAFAFA;text-align: center;">
                <tr>
                    <td>
                        <h1
                            style="font-style: normal;font-weight: 600;font-size: 22px;line-height: 28px;margin-bottom: 24px;color: #2BBD04;">
                            Entre em contato com a comunidade</h1>
                    </td>
                </tr>
            </table>
            <table
                style="max-width: 600px; margin: auto; width: 100%;padding: 8px 0px 72px 0px; color: #FAFAFA;text-align: center;">
                <tr>
                    <td>
                        <p
                            style="font-style: normal; font-weight: 400; font-size: 16px;line-height: 24px; color:#95DE81;">
                            <a href="https://discord.gg/KffrMsrE"
                                style="font-style: normal; font-weight: 400; font-size: 16px;line-height: 24px; text-decoration: none;color:#95DE81;padding: 16px;">
                                <img src="https://dapp.kannacoin.io/assets/mails/Discord Outline.png"
                                    style="vertical-align: middle; margin-right: 8px;">Discord da Kanna</a> |
                            <a href="https://dapp.kannacoin.io/"
                                style="font-style: normal; font-weight: 400; font-size: 16px;line-height: 24px; text-decoration: none;color:#95DE81;padding: 16px;">
                                <img src="https://dapp.kannacoin.io/assets/mails/card-two.png" style="vertical-align: middle;margin-right: 8px;">Plataforma
                                dApp</a>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    <div style="background-color: #020B00; padding: 0;">
        <div style="max-width: 800px; margin:auto;">
            <!-- FOOTER -->
            <table style="max-width: 600px; margin: auto; width: 100%;padding: 40px 0px 0px 0px;text-align: center;">
                <tr>
                    <td>
                        <img src="https://dapp.kannacoin.io/assets/mails/knn-white.png" alt="Logo Kanna" style="width:120px;margin-bottom:40px;">
                        <p style="color: #FF8D3A;font-size: 16px; font-weight: 500;margin: 0px 0px 16px 0px;">Gere
                            impacto ambiental e social com KNN
                        </p>
                    </td>
                </tr>
            </table>
            <table style="max-width: 600px; margin: auto; width: 100%;padding: 0px;text-align: center;">
                <tr>
                    <td style="padding: 16px 0px;">
                        <p
                            style="font-style: normal; font-weight: 400; font-size: 12px;line-height: 24px; color:#95DE81;">
                            <a href="mailto:contato@kannacoin.io"
                                style="font-style: normal; font-weight: 400; font-size: 12px;line-height: 24px; text-decoration:underline;color:#95DE81;text-align: right;">
                                contato@kannacoin.io</a> |
                            <a href="https://kannacoin.io/" target="_blank"
                                style="font-style: normal; font-weight: 400; font-size: 12px;line-height: 24px; text-decoration:underline;color:#95DE81;text-align: left;">
                                https://kannacoin.io/</a>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
`;