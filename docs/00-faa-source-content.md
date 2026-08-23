# Curated FAA Source Content

This chapter turns the three supplied sources into a navigable reference. It is
a faithful synthesis, not a copy of the web pages. Use the source links for the
controlling text and current interface.

## 1. FAA “Become a Certificated Remote Pilot” page

Source: [FAA certification page](https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot)

### Purpose

Part 107 operations require a Remote Pilot Certificate with a small UAS rating.
The certificate shows that the holder understands applicable regulations,
operating requirements, and safe procedures. There are separate routes for a
first-time pilot and a qualifying Part 61 certificate holder.

### First-time pilot content

Eligibility:

- Be at least 16.
- Read, speak, write, and understand English.
- Be physically and mentally able to operate safely.
- Pass the **Unmanned Aircraft General – Small (UAG)** initial knowledge test.

FAA process presented on the page:

1. Create an IACRA profile and obtain an FTN before registering for the test.
2. Schedule at an FAA-approved PSI testing center and bring government-issued
   photo identification.
3. Pass UAG. Tested subjects include regulations, airspace/restrictions,
   weather, loading/performance, emergencies, crew resource management, radio
   procedures, physiology, decision-making, airports, maintenance/preflight,
   and night operations.
4. Complete Form 8710-13 in IACRA. Choose `Pilot`, then `Remote Pilot`, follow
   the prompts, enter the 17-digit exam ID when available, sign, and submit. The
   result can take up to 48 hours to appear in IACRA.
5. After the TSA security background check, use the FAA email instructions to
   print the temporary certificate.
6. The FAA mails the permanent certificate after internal processing.
7. Keep the certificate readily accessible whenever operating.

### Existing Part 61 pilot content

This route is available to a person who holds a Part 61 pilot certificate and
has completed a flight review within the previous 24 calendar months:

1. Create or use an FAASTeam account.
2. Complete **ALC-451 Part 107 Small UAS Initial** online training.
3. Create or use an IACRA account.
4. Complete Form 8710-13 for `Pilot → Remote Pilot` and submit it.
5. Bring the application, photo ID, pilot certificate, current flight-review
   evidence, and course completion certificate to an FSDO, DPE, ACR, or CFI for
   identity and eligibility validation.
6. The representative processes the application. A CFI can process an IACRA
   application but does not directly issue a temporary certificate outside that
   process.
7. Keep the temporary/permanent certificate accessible during operations.

### Currency content

Within the preceding 24 calendar months, complete:

- **ALC-677** for any Part 107 certificate holder; or
- **ALC-515** for a Part 107 pilot who is also Part 61 certificated and has a
  current flight review.

These courses are online and free. Currency is required to exercise Part 107
privileges; it is separate from possessing the certificate card.

## 2. IACRA content

Sources: [IACRA](https://iacra.faa.gov/IACRA/Default.aspx) and
[IACRA New User Guide](https://iacra.faa.gov/IACRA/HelpAndInfo.aspx?id=5)

IACRA is the FAA's web application for airman certificate/rating applications.
It validates data, supports electronic signatures, sends application material
to the Airman Registry, and can provide temporary certificates.

For a new remote-pilot applicant:

- Select **Register**, choose the **Applicant** role, accept the terms, and
  complete the profile.
- Use the full legal name, including suffix, exactly as it will appear on the
  knowledge test and identification.
- Leave existing-certificate fields blank if none are held.
- Supply a working email address; the FAA uses it for notifications.
- Save the displayed/emailed FTN. It is the applicant's persistent identifier,
  not the certificate number or the 17-digit exam ID.
- Starting an application triggers additional personal-information fields.
- Use the “Remote Pilot with Knowledge Test” path or, when eligible, “Remote
  Pilot with Training Course” path.

IACRA also provides a separate training site with fictitious accounts, allowing
practice without altering a real application.

## 3. Remote Pilot ACS content

Source: [FAA-S-ACS-10B](https://www.faa.gov/sites/faa.gov/files/training_testing/testing/acs/uas_acs.pdf)

The ACS is the knowledge-test blueprint. Its hierarchy is:

```text
Area of Operation → Task → Knowledge element
UA.I.B.K10 = UAS / Regulations / Operating Rules / VLOS
```

The five tested Areas are:

1. Regulations: general rules, operating rules, certification, waivers,
   operations over people, and Remote ID.
2. Airspace: classification and operating requirements.
3. Weather: information sources and performance effects.
4. Loading and performance.
5. Operations: communications, airports, emergencies, decision-making,
   physiology, and maintenance/inspection.

The UAG test contains 60 independent multiple-choice questions, permits two
hours, and requires 70%. The ACS allocation is 15–25% Regulations, 15–25%
Airspace, 11–16% Weather, 7–11% Loading/Performance, and 35–45% Operations.

At completion, the AKTR contains the score, test identifier, and ACS codes for
incorrect answers. A passing AKTR is valid for an application for 24 calendar
months. After failure, the applicant must wait 14 calendar days, present the
failed report when retesting, and needs no instructor endorsement.

The ACS appendices also cover identification, testing centers, permitted and
prohibited test aids, special accommodations, test conduct, application paths,
references, and acronyms. The proctor determines whether a test aid is allowed.

## What each system does

| System | Purpose | Identifier/output |
|---|---|---|
| IACRA | Airman profile and certificate application | FTN, application, temporary certificate |
| PSI | Schedule/take FAA knowledge test | AKTR and 17-digit exam ID |
| FAASTeam | Initial/recurrent online training | Course completion certificate |
| FAA DroneZone | Register aircraft; manual airspace requests/other UAS services | Aircraft registration number/certificate |
| LAANC provider | Request eligible controlled-airspace authorization | Time/location/altitude-specific authorization |

An IACRA account does **not** register an aircraft. A Remote Pilot Certificate
does **not** authorize every flight. Aircraft registration, Remote ID, airspace,
operating-rule, and site requirements are separate gates.
