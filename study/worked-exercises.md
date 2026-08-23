# Worked Knowledge Exercises

These are original training scenarios, not FAA test questions. Solve each before
reading the worked answer. Chart scenarios use synthetic data so learners must
also practice with current FAA charts and the FAA testing supplement.

## EX-CHART-01 — Airspace shelf and altitude references

**ACS:** UA.II.A.K1, K1b; UA.II.B.K2; UA.I.B.K16

**Scenario:** A synthetic sectional shows a solid magenta Class C shelf labeled
`40/15`. Terrain at the proposed point is 620 feet MSL. The mission requests 300
feet AGL. No authorization has been issued.

**Questions:** What are the shelf floor/ceiling? What is the aircraft altitude
MSL? Is §107.41 authorization required at the proposed altitude?

**Worked answer:** The label means 1,500–4,000 feet MSL. The aircraft would be
approximately 920 feet MSL (`620 + 300`), below that shelf. That alone does not
settle the airspace: inspect whether the point lies inside an underlying Class C
surface segment or other controlled surface area. If it is only beneath the
1,500-foot shelf and the lower airspace is Class G, §107.41 authorization is not
required solely because of the shelf. Check the exact current chart, TFRs,
NOTAMs, and local/site constraints.

**Trap:** Treating `15` as 1,500 AGL or treating every point inside the outer
lateral ring as surface Class C.

## EX-CHART-02 — Class E and facility-map reasoning

**ACS:** UA.II.A.K1d; UA.II.B.K2; UA.I.B.K21b

**Scenario:** A point lies inside a dashed magenta boundary surrounding an
airport. The UAS Facility Map grid says `100`. The mission is 75 feet AGL.

**Worked answer:** Dashed magenta depicts Class E designated to the surface for
an airport. Prior authorization is required. The `100` facility-map value is not
permission; request and receive authorization through an eligible LAANC provider
or the FAA route, then obey its area, time, altitude, and special provisions.

## EX-AIRSPACE-03 — Structure rule versus authorization

**ACS:** UA.I.B.K16, K21b; UA.II.B.K2

**Scenario:** A 250-foot structure is in Class D airspace. A close inspection
would remain within 100 feet horizontally and rise to 500 feet AGL. A LAANC
authorization permits no higher than 200 feet AGL.

**Worked answer:** The structure provision could make 500 feet compatible with
§107.51(b) because it is 250 feet above the 250-foot structure and within 400
feet horizontally. It does not override the 200-foot authorization ceiling.
The flight cannot use that authorization at 500 feet; modify the mission or
obtain suitable authorization and verify all other limits.

## EX-AIRPORT-01 — Chart Supplement extraction

**ACS:** UA.V.B.K1, K4, K6, K6b; UA.V.A.K1–K5

**Synthetic entry:** `CTAF 122.8; RWY 09/27; TPA 1600 MSL; field elev 620;
RP RWY 27; parachute jumping; dawn–dusk.`

**Questions:** What frequency should be monitored? What is pattern height AGL?
What nonstandard pattern exists? Name two mission hazards.

**Worked answer:** Monitor 122.8 MHz. Pattern height is about 980 feet AGL
(`1,600 − 620`). Runway 27 uses right traffic. Hazards include descending
parachutists/jump aircraft and concentrated traffic near the 09/27 pattern;
limited published operating hours may affect services but do not prove no
traffic outside them. Verify the current Chart Supplement and NOTAMs.

## EX-RUNWAY-01 — Runway and traffic orientation

**ACS:** UA.V.B.K3, K4; UA.V.A.K8

**Scenario:** Aircraft report left downwind runway 18. The drone site is just
east of the runway near midfield.

**Worked answer:** Runway 18 is oriented approximately 180° magnetic. For left
traffic, the downwind leg is east of the runway with aircraft traveling north,
placing the drone site in a high-conflict area. Relocate or establish controls;
authorization alone would not remove the duty to yield and remain well clear.

## EX-COMMS-01 — Interpret a traffic call

**ACS:** UA.V.A.K2, K3, K6–K8; UA.V.B.K2, K4

**Call:** `Springfield traffic, Skyhawk Seven Three Alpha, five miles west,
inbound for left traffic runway two seven, Springfield.`

**Worked answer:** A Cessna-type aircraft is five miles west and intends to join
the left pattern for a runway oriented approximately 270° magnetic. The remote
crew should identify the likely arrival corridor, maintain visual scanning,
yield early, and land/hold if separation is uncertain. Monitoring aids awareness;
the remote PIC does not acquire priority or a clearance from this call.

## EX-WX-01 — METAR decode and legal minimums

**ACS:** UA.III.A.K2; UA.III.B.K1b, K1j; UA.II.B.K1

**Report:** `KXYZ 231753Z 21014G24KT 3SM -RA BKN006 OVC015 18/17 A2986`

**Worked answer:** Observation on the 23rd at 1753 UTC; wind from 210° true at
14 knots gusting 24; 3 statute miles visibility; light rain; broken 600 feet and
overcast 1,500 feet; 18°C/17°C; altimeter 29.86. The ceiling is 600 feet AGL.
Although visibility equals the Part 107 minimum, gusts, rain, low ceiling,
cloud-clearance needs, aircraft limits, and VLOS may make the flight unsafe or
illegal. A legal boundary is not a go decision.

## EX-WX-02 — TAF time window

**ACS:** UA.III.A.K3; UA.III.B.K1d, K1e, K1j

**Forecast:** `TAF KXYZ 231720Z 2318/2418 19010KT P6SM SCT040 TEMPO
2320/2323 3SM TSRA BKN020CB FM240100 30008KT P6SM SKC`

**Worked answer:** From 1800Z on the 23rd, base conditions are wind 190° at 10
knots, visibility over 6 SM, scattered 4,000 feet. Temporarily 2000–2300Z,
thunderstorms/rain may reduce visibility to 3 SM with broken cumulonimbus at
2,000 feet. From 0100Z on the 24th, wind becomes 300° at 8 knots with over 6 SM
and clear sky. A 2130Z mission lies in the thunderstorm window and should be
delayed or cancelled, not justified by the more favorable base line.

## EX-WX-03 — Density altitude and energy

**ACS:** UA.III.B.K1a–K1c; UA.IV.A.K1a, K2

**Scenario:** At a high-elevation site on a hot afternoon, the aircraft carries
its maximum approved payload. A prior cool-morning flight used 65% battery.

**Worked answer:** High elevation and temperature increase density altitude,
reducing aerodynamic/thrust margin. Payload increases power demand, while heat
can worsen battery and motor margins. The prior flight is not sufficient proof.
Use manufacturer data for the actual configuration/conditions, reduce payload or
scope, set a larger reserve, and conduct a conservative functional check.

## EX-PERF-01 — Weight and reserve calculation

**ACS:** UA.IV.A.K1, K1a, K2; UA.I.A.K1

**Data:** Aircraft 46.8 lb; battery 4.2 lb; payload 3.1 lb; guards/light 0.7 lb.

**Worked answer:** Total is 54.8 lb, which is less than 55 lb. Only 0.2 lb of
weight margin remains, but regulatory weight margin is not performance margin.
Confirm CG, attachment security, manufacturer limits, density altitude, wind,
endurance, and contingency reserve. Adding a 0.3-lb accessory would produce
55.1 lb and leave the operation outside the small-aircraft definition.

## EX-NIGHT-01 — Night mission decision

**ACS:** UA.I.B.K25; UA.II.B.K6–K10; UA.V.C.K7; UA.V.E.K6, K8, K9; UA.V.F.K6

**Scenario:** The remote PIC is current. The anti-collision light is visible for
three statute miles, but a daylight survey reveals an unlit wire across the
route. Bright parking-lot lights cause glare at the control station.

**Worked answer:** The light and currency satisfy only part of the requirements.
The wire and glare degrade hazard detection and night vision. Move the route or
control station, create conspicuous boundaries, adjust display/light intensity,
brief illusions and scanning, and cancel if the wire cannot remain reliably
clear. Recheck airspace authorization and inspect the light/system before launch.

## EX-ADM-01 — Integrated go/no-go

**ACS:** UA.V.D.K1–K5; UA.V.E.K5, K7; UA.V.C.K1

**Scenario:** A client pressures the crew to launch before a storm. The remote
PIC slept four hours, wind is approaching the aircraft limit, and the alternate
landing area is occupied.

**Worked answer:** PAVE identifies pilot fatigue, environmental wind/storm risk,
and external pressure; IMSAFE flags fatigue. Loss of the alternate reduces
contingency margin. Delay or cancel. “Staying under a limit” does not cure the
combined risk or hazardous decision pressure. Record the decision and conditions.

## Independent practice protocol

For each exercise, change at least two facts and solve again. Record the ACS code,
answer, source checked, and error category in `study/review-log.csv`. Use current
FAA charts, Chart Supplements, NOTAM/TFR sources, and aviation weather for live
practice; synthetic examples cannot establish current operational conditions.
