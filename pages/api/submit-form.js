import sgMail from '@sendgrid/mail';
import fetch from "isomorphic-unfetch";

// Sends mail through SendGrid
async function sendMail(recipientAddress, name, email, msg) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mail = {
        to: recipientAddress,
        from: 'no-reply@yourDomainHere.com',
        subject: 'New form',
        text: `Name: ${name}\nemail: ${email}\nMessage:\n${msg}`,
        html: `
            <div style="margin-bottom: 16px">
                <strong>Name:</strong> ${name}
            </div>
            <div style="margin-bottom: 16px">
                <strong>email:</strong> ${email}
            </div>
            <div style="margin-bottom: 4px">
                <strong>Message:</strong>
            </div>
            <div style="white-space: pre-line">${msg}</div>
        `,
    };

    return await sgMail.send(mail);
}

export default async (req, res) => {
    try {
        const { name, email, msg, captchaResponse } = req.body;

        if (!process.env.SENDGRID_API_KEY || !process.env.CAPTCHA_SERVER_SECRET) {
            throw 'ENV secrets not set'
        }

        if (!name || !email || !msg || !captchaResponse) {
            throw 'Form data incomplete';
        }

        // Verify captcha
        const captchaVerifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `response=${encodeURIComponent(captchaResponse)}&secret=${encodeURIComponent(process.env.CAPTCHA_SERVER_SECRET)}`
        });

        let captchaVerifyResponseData = await captchaVerifyResponse.json();

        if (captchaVerifyResponseData.success == false) {
            throw 'Captcha validation error'
        }

        await sendMail('yourEmailHere', name, email, msg);

        res.status(200).json({status: 'OK'});        

    } catch (e) {
        console.log(e);
        res.status(500).json({error: "Internal Error"});
    }
}