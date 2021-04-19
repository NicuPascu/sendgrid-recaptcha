import React from 'react'
import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import CookieConsent from 'react-cookie-consent';
import ReCAPTCHA from 'react-google-recaptcha';

import Spinner from '../public/spinner.svg';
import CheckIcon from '../public/check-icon.svg';

import '../styles/style.scss'

export default class Index extends React.Component {
    static async getInitialProps() {
        return {
            captchaSecret: process.env.CAPTCHA_CLIENT_SECRET || ""
        }
    }

    constructor (props) {
        super(props)

        this.state = {
            captchaValid: false,
            submittingForm: false,
            formSubmitted: false
        }
    }

    sendContactForm = async (e) => {
        if (e) {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            let formDataObj = {};
            formData.forEach((value, key) => {formDataObj[key] = value});

            const { name, email, msg } = formDataObj;
            const captchaResponse = formDataObj['g-recaptcha-response'];

            this.setState({
                submittingForm: true
            });

            let response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    msg,
                    captchaResponse
                })
            });

            let data = await response.json();

            if (data.status == 'OK') {
                this.setState({
                    formSubmitted: true
                });
            }
        }
    }

    captchaValidated = (value) => {
        this.setState({
            captchaValid: value ? true : false
        });
    }

    render() {
        const { captchaSecret } = this.props;
        const { submittingForm, formSubmitted } = this.state;

        return (
            <>
                <Head>
                    <title>Sendgrid Recaptcha example</title>
                    <meta name="og:title" property="og:title" content={`Sendgrid Recaptcha example`}></meta>
                    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
                </Head>
                <div id="top-container" className="pt-3">
                    <CookieConsent buttonText="Accept">
                        Pentru scopuri precum afișarea de conținut personalizat, folosim module cookie sau tehnologii similare.
                        Apăsând Accept sau navigând pe acest website, ești de acord să permiți colectarea de informații prin cookie-uri
                        sau tehnologii similare.
                    </CookieConsent>

                    <div id="contact-form" className="container">
                        <div className="row my-5">
                            <div className="col-12">
                                { !formSubmitted ?
                                    <>
                                        <h3>Send us a message</h3>
                                        <form className="rounded border bg-light p-3 mt-3" onSubmit={this.sendContactForm}>
                                            <div className="form-group">
                                                <input type="text" name="name" required className="form-control" id="contactNameInput" placeholder="Name" />
                                            </div>

                                            <div className="form-group">
                                                <input type="email" name="email" required className="form-control" id="contactEmailInput" placeholder="email" />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="contactMsgTextArea">Message</label>
                                                <textarea name="msg" required className="form-control" id="contactMsgTextArea" rows="4"></textarea>
                                            </div>

                                            <ReCAPTCHA
                                                sitekey={captchaSecret}
                                                onChange={this.captchaValidated}
                                            />

                                            { !submittingForm ?
                                                <button disabled={!this.state.captchaValid && true} type="submit" className={`btn btn-${this.state.captchaValid ? 'primary' : 'secondary'} mt-3`}>Send</button>
                                            :
                                                <div className="mt-3">
                                                    <Spinner width="38" />
                                                </div>
                                            }
                                        </form>
                                    </>
                                :
                                    <strong className="bold text-success">
                                        <CheckIcon width="17" height="17" fill="#28a745" /> The form has been succesfully sent.
                                    </strong>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
