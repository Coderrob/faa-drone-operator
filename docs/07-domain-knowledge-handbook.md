# Drone Pilot Domain Knowledge Handbook

The ACS identifies what may be tested. This handbook connects those requirements
to the decisions a competent remote PIC makes before, during, and after a mission.

## 1. Regulatory operating model

Evaluate a proposed flight through independent gates:

```text
Pilot qualified/current
  → aircraft registered/marked and Remote ID compliant
  → airspace legal and authorized
  → operation fits Part 107 or a waiver
  → aircraft and crew fit for this mission
  → site, local, landowner, privacy, and client constraints satisfied
  → current conditions remain inside limits
```

Passing one gate never passes another. For example, LAANC addresses controlled
airspace access but does not permit flight over people, waive VLOS, override a
TFR, or grant permission to launch from private property.

The remote PIC has final authority and responsibility. Another person may
manipulate the controls only when directly supervised so the remote PIC can
immediately take control. The crew must know who holds each role.

## 2. Airspace and chart literacy

### Vertical references

- **AGL** measures height above terrain directly below; Part 107 altitude limits
  normally use AGL.
- **MSL** measures from mean sea level; sectional airspace floors/ceilings and
  obstacle elevations commonly use MSL.
- Convert deliberately: approximate aircraft MSL altitude = terrain elevation
  MSL + aircraft height AGL. Terrain changes matter along the route.

### Controlled-airspace recognition

- Class B: solid blue boundaries; shelves are individually labeled.
- Class C: solid magenta boundaries; inner/outer shelves are labeled.
- Class D: dashed blue boundary; check tower hours and surrounding Class E/G.
- Class E to surface: dashed magenta boundary when designated for an airport.
- Class E beginning at 700 ft AGL: magenta vignette; at 1,200 ft AGL, blue
  vignette or default structures depending on chart context.
- Class G is the uncontrolled portion below overlying controlled airspace.

These are chart-reading cues, not substitutes for the sectional legend. Determine
the class at the exact latitude/longitude and altitude, including overlapping
shelves and chart notes.

### Authorization workflow

For Class B, C, D, or surface Class E designated for an airport:

1. Define exact polygon/radius, date/time, maximum requested altitude, and remote PIC.
2. Inspect the UAS Facility Map value. It is a planning ceiling for streamlined
   processing, not authorization by itself.
3. Use an FAA-approved LAANC provider for eligible locations. At/below map values,
   approval may be near-real-time. Further coordination above a value—including
   a zero-foot grid—requires review and should be requested at least 72 hours ahead.
4. For non-LAANC airports or manual needs, use DroneZone; the FAA advises filing
   at least 60 days before the operation.
5. Read the issued authorization: time, boundary, altitude, notification,
   cancellation, and special provisions are controlling.
6. Recheck TFRs, NOTAMs, weather, and traffic immediately before flight.

### Special-use and temporary restrictions

- Prohibited area: flight prohibited without permission from the controlling agency.
- Restricted area: hazardous/unusual activity; authorization/status matters.
- MOA/Alert/Warning area: not all prohibit VFR access, but each signals elevated risk.
- TFR: temporary regulatory restriction; never rely on an old screenshot.
- Stadium, wildfire, national security, disaster, and VIP restrictions can be
  time- and event-dependent. Confirm through current FAA sources.

## 3. Weather interpretation

### METAR decoding sequence

Example structure (illustrative only):

```text
KABC 231753Z 18012G20KT 6SM -RA BKN025 OVC050 24/20 A2992
```

Read station → UTC observation time → wind direction/speed/gust → visibility →
weather → sky condition → temperature/dew point → altimeter. `BKN` or `OVC` is a
ceiling layer; `025` means 2,500 ft AGL at the reporting station. `VRB`, `AUTO`,
`RMK`, and variable-wind groups require separate interpretation.

### TAF reasoning

A TAF forecasts conditions for a defined airport area and period. Separate the
base forecast from `FM` changes, gradual/temporary (`BECMG`/`TEMPO`) groups, and
probability groups where used. Match mission time to UTC and identify the worst
credible interval—not merely the opening line.

### Small-drone effects

- Headwind on return can turn adequate displayed battery into an emergency;
  plan the demanding leg and reserve first.
- Gust spread and mechanical turbulence near buildings/trees can exceed the
  average surface wind.
- Hot, high, low-pressure conditions increase density altitude and reduce thrust
  margin; payload and battery heat compound the effect.
- Cold reduces available battery performance; heat accelerates battery stress.
- Fog/low cloud can violate visibility/cloud clearance and obscure VLOS.
- Icing, thunderstorms, microbursts, lightning, and hail are avoidance hazards,
  not conditions to “test” with a small aircraft.

## 4. Aircraft performance and energy

Weight includes aircraft, battery, payload, guards, lighting, attachments, and
anything carried. Record takeoff configuration; “empty weight” is insufficient.

Center of gravity outside the manufacturer's envelope can reduce stability,
consume control authority, increase motor loading, and make automatic flight
behave unexpectedly. Secure payloads so they cannot shift, detach, obstruct
sensors, block cooling, or interfere with RID/GNSS/antennas.

Battery discipline:

- Assign packs unique identifiers and log cycles/abnormal behavior.
- Inspect for swelling, puncture, damaged leads, contamination, and temperature.
- Use manufacturer-approved chargers/settings on a noncombustible surface and
  do not charge unattended.
- Allow packs to cool; respect storage-charge guidance and transport terminal protection.
- Establish mission return/land thresholds based on wind, distance, temperature,
  payload, battery history, and safe alternates.
- Quarantine damaged packs and follow applicable disposal/transport rules.

## 5. Visual line of sight and human performance

VLOS means the aircraft can be seen unaided (corrective lenses permitted) well
enough to know location, attitude, altitude, direction, and hazards. FPV/video is
not a substitute. Binoculars may be used only momentarily for situational
awareness, not to extend the operation beyond VLOS.

VLOS degrades with distance, haze, backlighting, terrain/structures, small
aircraft size, camouflage, fatigue, and screen fixation. Design a smaller
operating area than the theoretical radio range.

A visual observer is optional in many missions but valuable when workload or
hazards justify one. Establish continuous effective communication and explicit
callouts such as `TRAFFIC`, bearing, direction, and the agreed response. The
remote PIC and VO cannot serve more than one operation at a time.

## 6. Night operations

Night is more than attaching a light:

- The remote PIC must have completed the updated initial test or qualifying
  recurrent training.
- Anti-collision lighting must be visible for at least three statute miles and
  flash sufficiently to avoid collision; intensity may be reduced when the
  remote PIC determines it is in the interest of safety.
- Controlled-airspace authorization is still required where applicable.
- Inspect lighting, protect night vision, avoid staring at bright displays, and
  account for autokinesis, false horizons, reduced depth perception, and unlit
  wires/obstacles.
- Perform a daylight site survey when possible and use conservative boundaries.

## 7. Operations over people and vehicles

Category is an aircraft-and-operation eligibility determination, not a pilot's
personal declaration.

- Category 1: aircraft is 0.55 lb or less throughout the operation and has no
  exposed rotating parts capable of laceration. Sustained flight over an
  open-air assembly requires Remote ID compliance.
- Categories 2 and 3: performance-based aircraft eligibility, including injury
  severity limits, no dangerous exposed rotating parts, and FAA-accepted means/
  declaration of compliance and labeling. Category 3 has stricter site and
  sustained-flight restrictions and cannot operate over open-air assemblies.
- Category 4: aircraft has an eligible Part 21 airworthiness certificate and is
  operated/maintained within its approved limitations.

“Over” means directly over any part of a person, even briefly. For moving
vehicles, eligible Category 1–3 operations must either occur within/over a
closed or restricted-access site with occupants on notice, or avoid sustained
flight over moving vehicles. Category 4 follows its approved limitations.

## 8. Remote ID operational knowledge

Standard Remote ID broadcasts aircraft ID, aircraft position/altitude/velocity,
control-station position/elevation, time mark, and emergency status. A broadcast
module broadcasts its ID, aircraft position/altitude/velocity, takeoff position/
elevation, and time mark. Both operate by local radio broadcast rather than a
requirement to upload the flight to a network service.

Before flight, verify the correct RID serial is in DroneZone and the system
reports normal operation. If Standard Remote ID fails in flight, the rule's
in-flight malfunction procedure and safe landing judgment apply; do not launch
with known failure. A module requires VLOS. A non-RID aircraft may fly in a FRIA
only within its boundaries and VLOS under the FRIA rules.

## 9. Airport environment and communications

Runway numbers approximate magnetic heading divided by ten; parallel runways use
L/C/R. Learn threshold, centerline, hold-short, displaced-threshold, and closed-
runway markings. Helicopters, agricultural aircraft, medevac, law enforcement,
and aircraft without radio calls may appear low and outside the expected pattern.

CTAF monitoring can improve awareness, but receiving no call does not mean no
traffic. ATIS supplies recorded airport/weather information; UNICOM is a
nongovernment advisory service. Use aviation radio only when authorized and
competent; concise standard phraseology prevents rather than creates confusion.

## 10. Emergency and abnormal procedures

Create aircraft/site-specific memory actions, then use a checklist when time permits:

- **Manned aircraft:** descend/land or maneuver well clear immediately; never
  demand right-of-way.
- **Lost control link:** execute known lost-link behavior; monitor trajectory;
  warn affected people; do not let automatic RTH enter controlled/occupied space.
- **Lost GNSS:** expect loss of position hold and automated-route reliability;
  take manual control if proficient and land safely.
- **Flyaway:** track last position/direction/energy, notify appropriate parties
  when it creates a hazard, preserve logs, and evaluate accident reporting.
- **Low battery:** use the nearest safe landing option before forced shutdown;
  property protection is secondary to people and aircraft.
- **Lithium-battery fire:** protect people, call emergency services when needed,
  use the response method appropriate to equipment/site, watch for re-ignition,
  and isolate involved packs.

The FAA accident report is due within 10 calendar days when the operation causes
serious injury, loss of consciousness, or at least $500 damage to property other
than the sUAS. Preserve objective records and do not delay emergency response to
complete paperwork.

## 11. Common mission domains

### Photography and video

Plan subject movement, sun angle, privacy, property access, and a flight path
that avoids fixation on framing. A camera operator can reduce remote-PIC workload;
the remote PIC must not surrender aircraft authority to obtain a shot.

### Mapping and photogrammetry

Learn ground sample distance, overlap/sidelap, shutter speed, rolling-shutter
effects, lighting consistency, coordinate systems, ground control/check points,
and vertical accuracy. Automated grids remain subject to VLOS, airspace, altitude,
people, and vehicle rules. Validate outputs; a visually attractive model is not
necessarily survey-grade.

### Infrastructure inspection

Identify electromagnetic interference, compass/GNSS multipath, wires, confined
spaces, turbulent flow around structures, reflective/texture-poor surfaces, and
client lockout/site safety programs. Maintain stand-off distance and independent
collision awareness while the camera is zoomed in.

### Construction and real estate

Coordinate active equipment, cranes, workers, adjacent roads, property rights,
and repeatable data capture. Part 107 compliance does not grant access to a site
or permission to capture/use private information.

### Agriculture

Expect low-flying agricultural aircraft, remote terrain, dust, heat, large-area
VLOS limitations, and chemical-specific laws. Applying or dispensing substances
may trigger additional FAA certification and federal/state pesticide rules far
beyond a basic Part 107 certificate.

### Public safety

Part 107 and public-aircraft/COA frameworks are distinct. Add agency policy,
incident command, evidence retention, cybersecurity, scene airspace coordination,
and emergency TFR knowledge. Emergency purpose does not automatically waive FAA rules.

## Competency standard beyond the test

A job-ready beginner should demonstrate, under supervision where appropriate:

- Stable manual takeoff, hover, orientation changes, rectangular patterns,
  approaches, landing, and controlled response without GNSS position hold.
- Correct setup and explanation of RTH/lost-link behavior.
- A documented airspace/weather/site briefing and defensible go/no-go decision.
- Crew briefing and response to injected traffic, person incursion, low battery,
  and link-loss scenarios.
- Accurate logs, defect handling, and postflight review.
- Willingness to stop when conditions exceed skill, authorization, or equipment.
