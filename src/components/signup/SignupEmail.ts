export interface SignupFormData {
    anrede: string;
    vorname: string;
    name: string;
    strasse: string;
    plz: string;
    ort: string;
    email: string;
    telefon: string;
    geburtsdatum: string;
    schonDabei?: string;
    stimmlage: string;
    demoAufnahme: string;
    mitteilung?: string;
}

export function getSignupEmailContent(formData: SignupFormData) {
    // Format geburtsdatum (YYYY-MM-DD) to DD.MM.YYYY
    let formattedGeburtsdatum = formData.geburtsdatum;
    if (formData.geburtsdatum && formData.geburtsdatum.includes('-')) {
        const [year, month, day] = formData.geburtsdatum.split('-');
        formattedGeburtsdatum = `${day}.${month}.${year}`;
    }

    const subject = `Anmeldung Gospelproject ${formData.vorname} ${formData.name}`;

    const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
                <h2 style="color: #000; margin: 0; font-weight: 700;">Gospelproject Anmeldung</h2>
            </div>
            
            <div style="padding: 30px 0;">
                <h3 style="color: #333; margin-top: 0;">Vielen Dank für Deine Anmeldung, ${formData.vorname}!</h3>
                <p>Wir haben Deine Daten erfolgreich erhalten. Hier ist eine Zusammenfassung Deiner Angaben:</p>
                
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Anrede</strong></td>
                            <td style="padding: 8px 0;">${formData.anrede}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Name</strong></td>
                            <td style="padding: 8px 0;">${formData.vorname} ${formData.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Adresse</strong></td>
                            <td style="padding: 8px 0;">${formData.strasse}, ${formData.plz} ${formData.ort}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>E-Mail</strong></td>
                            <td style="padding: 8px 0;">${formData.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Telefon</strong></td>
                            <td style="padding: 8px 0;">${formData.telefon}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Geburtsdatum</strong></td>
                            <td style="padding: 8px 0;">${formattedGeburtsdatum}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Stimmlage</strong></td>
                            <td style="padding: 8px 0;">${formData.stimmlage}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Demo-Material</strong></td>
                            <td style="padding: 8px 0;">${formData.demoAufnahme}</td>
                        </tr>
                        ${formData.schonDabei ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Dabei gewesen</strong></td>
                            <td style="padding: 8px 0;">${formData.schonDabei}</td>
                        </tr>
                        ` : ''}
                        ${formData.mitteilung ? `
                        <tr>
                            <td style="padding: 15px 0 8px 0; color: #64748b; vertical-align: top;"><strong>Mitteilung</strong></td>
                            <td style="padding: 15px 0 8px 0; font-style: italic;">${formData.mitteilung.replace(/\\n/g, '<br>')}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <p>Wir freuen uns sehr auf die gemeinsame Zeit!</p>
                <p style="margin-bottom: 0;">Herzliche Grüsse,</p>
                <p style="margin-top: 5px; font-weight: bold; color: #000;">Dein Gospelproject-Team</p>
            </div>
            
            <div style="padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #94a3b8; text-align: center;">
                <p>© ${new Date().getFullYear()} Gospelproject. Alle Rechte vorbehalten.</p>
            </div>
        </div>
    `;

    const textContent = `Vielen Dank für Deine Anmeldung zum Gospelproject!

Hier ist eine Zusammenfassung Deiner Angaben:
- Anrede: ${formData.anrede}
- Name: ${formData.vorname} ${formData.name}
- Adresse: ${formData.strasse}, ${formData.plz} ${formData.ort}
- E-Mail: ${formData.email}
- Telefon: ${formData.telefon}
- Geburtsdatum: ${formattedGeburtsdatum}
- Schon dabei gewesen: ${formData.schonDabei || '-'}
- Stimmlage: ${formData.stimmlage}
- Demo-Material: ${formData.demoAufnahme}
- Mitteilung: ${formData.mitteilung || '-'}

Wir freuen uns auf Dich!
Dein Gospelproject-Team`;

    return { subject, htmlContent, textContent };
}
