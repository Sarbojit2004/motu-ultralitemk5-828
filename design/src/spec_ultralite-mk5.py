"""The ten UltraLite mk5 slides.

Same design system as the TASCAM sets -- one display line on the measure, a
photograph punched through it, a wide lower photograph, a figure caption under
it, a plate register beside it, and the branding rail.

One thing differs, and it is forced by the library rather than chosen. The
Sonicview catalogue ran to 129 distinct frames, so its register could be a
global partition: every frame placed exactly once, nothing twice. This product
has 23. Ten slides need twenty of those for heroes and bands alone, which would
leave three plates for the whole set. So the register here is a curated
per-slide selection instead: every frame still appears somewhere, no frame
appears twice on the same slide, but a frame may serve as a hero on its own
slide and return as a plate on a related one.

Captions describe what is visible in the frames. The 2.4ms round-trip figure on
slide 06 is read off MOTU's own diagram (UL-03), not asserted independently.
"""

SPEC = {
"01": dict(
    name="01_ultralite-mk5",
    labels=("UltraLite mk5", "Half Rack"),
    head=("ULTRA", "LITE"),
    hero="UL-05", hero_mode="cut",
    band="UL-01", band_mode="scene", band_pos="center",
    plates=["UL-04", "UL-11", "UL-19", "UL-21", "UL-08", "UL-14"],
    cap_title=("The whole ", "box"),
    cap_body="A half-rack interface with the connectors on the front as well as "
             "the back, a metering strip beside the gain knobs, and a case short "
             "enough to sit beside a laptop rather than in front of it.",
    cap_meta="Above &mdash; on white",
    band_meta="Below &mdash; on a working desk",
),
"02": dict(
    name="02_ultralite-front-panel",
    labels=("Front Panel", "Gain &amp; Meters"),
    head=("PRE", "AMPS"),
    hero="UL-09", hero_mode="block",
    band="UL-21", band_mode="scene", band_pos="center",
    plates=["UL-05", "UL-04", "UL-19", "UL-01", "UL-12"],
    cap_title=("Set by ", "hand"),
    cap_body="The front carries the gain control, a select button and phantom "
             "power alongside a column of meters &mdash; input, main and line out "
             "read on the unit itself rather than only in the software.",
    cap_meta="Above &mdash; the gain section",
    band_meta="Below &mdash; the front, lit on black",
),
"03": dict(
    name="03_ultralite-rear-panel",
    labels=("Rear Panel", "Analog I/O"),
    head=("CONNEC", "TORS"),
    hero="UL-23", hero_mode="block",
    band="UL-11", band_mode="bbox", band_pos="center",
    plates=["UL-19", "UL-17", "UL-05", "UL-07", "UL-13"],
    cap_title=("Out the ", "back"),
    cap_body="A full-width row of jacks across the rear &mdash; the line "
             "inputs and outputs that do not fit on the front, laid out in one "
             "continuous bank rather than split across two panels.",
    cap_meta="Above &mdash; the rear panel",
    band_meta="Below &mdash; from above, on white",
),
"04": dict(
    name="04_ultralite-on-the-desk",
    labels=("On The Desk", "With A Laptop"),
    head=("DESK", "TOP"),
    hero="UL-12", hero_mode="block",
    band="UL-08", band_mode="scene", band_pos="center",
    plates=["UL-01", "UL-14", "UL-10", "UL-05", "UL-21"],
    cap_title=("Beside the ", "screen"),
    cap_body="MOTU photograph this one in use rather than on a sweep: headphones "
             "plugged into the front, a session open on the machine next to it, "
             "and a single cable running back to the computer.",
    cap_meta="Above &mdash; with a tablet session",
    band_meta="Below &mdash; headphones and a laptop",
),
"05": dict(
    name="05_ultralite-rack-ears",
    labels=("Rack Ears", "Nineteen Inch"),
    head=("HALF", "RACK"),
    hero="UL-17", hero_mode="cut",
    band="UL-19", band_mode="bbox", band_pos="center",
    plates=["UL-15", "UL-11", "UL-05", "UL-13", "UL-23"],
    cap_title=("Or in a ", "rack"),
    cap_body="The same chassis with ears fitted, which is what makes a half-rack "
             "box useful twice &mdash; loose on a desk while you are writing, "
             "bolted into a rack when the rig has to travel.",
    cap_meta="Above &mdash; ears fitted",
    band_meta="Below &mdash; three-quarter, on white",
),
"06": dict(
    name="06_ultralite-latency",
    labels=("Round Trip", "Hi-Speed USB"),
    head=("LAT", "ENCY"),
    hero="UL-03", hero_mode="block",
    band="UL-04", band_mode="scene", band_pos="center",
    plates=["UL-02", "UL-20", "UL-06", "UL-16", "UL-22"],
    cap_title=("There and ", "back"),
    cap_body="MOTU's own drawing of the path: analog in, over USB to the "
             "workstation, and back out again. The figure printed on it for that "
             "round trip is 2.4 milliseconds.",
    cap_meta="Above &mdash; MOTU's latency diagram",
    band_meta="Below &mdash; the unit on black",
),
"07": dict(
    name="07_ultralite-dsp-mixer",
    labels=("DSP Mixer", "Onboard"),
    head=("MIX", "ING"),
    hero="UL-02", hero_mode="block",
    band="UL-20", band_mode="scene", band_pos="center",
    plates=["UL-16", "UL-18", "UL-22", "UL-06", "UL-03"],
    cap_title=("Mixing on the ", "box"),
    cap_body="A mixer that runs on the interface rather than in the session: "
             "channel faders, monitor sends and a routing grid, driven from a "
             "browser page while the workstation gets on with recording.",
    cap_meta="Above &mdash; the device page",
    band_meta="Below &mdash; the fader view",
),
"08": dict(
    name="08_ultralite-channel-strip",
    labels=("Channel Strip", "Gate &middot; Comp &middot; EQ"),
    head=("EFF", "ECTS"),
    hero="UL-16", hero_mode="block",
    band="UL-18", band_mode="scene", band_pos="center",
    plates=["UL-22", "UL-20", "UL-02", "UL-09", "UL-06"],
    cap_title=("On the way ", "in"),
    cap_body="Each input carries its own processing &mdash; a gate and a "
             "compressor drawn as curves you drag, a parametric EQ on the band "
             "beneath, and a reverb that the whole mixer can feed.",
    cap_meta="Above &mdash; gate and compressor",
    band_meta="Below &mdash; the parametric EQ",
),
"09": dict(
    name="09_ultralite-what-plugs-in",
    labels=("Connections", "What Plugs In"),
    head=("SIGNAL", "FLOW"),
    hero="UL-07", hero_mode="block",
    band="UL-06", band_mode="scene", band_pos="center",
    plates=["UL-03", "UL-23", "UL-13", "UL-15", "UL-11"],
    cap_title=("Everything ", "at once"),
    cap_body="MOTU's connection drawing, which is the quickest answer to what the "
             "box is for: guitars and microphones in, MIDI and a controller "
             "alongside, monitors and headphones out, a computer on the other side.",
    cap_meta="Above &mdash; MOTU's connection diagram",
    band_meta="Below &mdash; the metering view",
),
"10": dict(
    name="10_ultralite-in-the-room",
    labels=("In The Room", "Amp &amp; Shelf"),
    head=("STU", "DIOS"),
    hero="UL-10", hero_mode="block",
    band="UL-14", band_mode="scene", band_pos="center",
    plates=["UL-01", "UL-08", "UL-12", "UL-21", "UL-04", "UL-05"],
    cap_title=("Rooms, not ", "sweeps"),
    cap_body="The frames shot where the thing actually lives &mdash; on a guitar "
             "amp with a lead running into it, and on a shelf between a monitor "
             "speaker, a keyboard and an instrument stand.",
    cap_meta="Above &mdash; on a guitar amp",
    band_meta="Below &mdash; a corner of a room",
),
}

# White-sweep frames get a bounding-box trim so the product fills its plate.
# Everything else -- lifestyle, software captures, diagrams -- goes in whole.
PREP = {k: dict(mode="bbox") for k in ["UL-05", "UL-11", "UL-17", "UL-19"]}
