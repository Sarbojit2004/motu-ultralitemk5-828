"""The ten MOTU 828 slides.

Two things about this library shape the build.

Every product frame is lit on black -- there is not one white sweep in the
set. The silhouette matte keys on a white ground flooded in from the frame
border, so on these frames it would find no background at all and hand back the
whole rectangle without raising anything. So no hero here is `cut` and no band
is `bbox`: they are hard-edged photo blocks, which is the honest treatment for
a product photographed on black anyway.

Five frames are held back, by the same ruling that kept the Dante certification
mark off the Sonicview slides: they are other companies' artwork rather than
photographs of the product -- the ESS Technology mark and the Loopmasters,
Lucid Samples and Big Fish Audio bundle covers, plus the collage of bundled
instrument thumbnails. MOTU's own CueMix mark and its own "USB 5 Gbps" and
latency drawings are kept, being the manufacturer's own material.
"""

SPEC = {
"01": dict(
    name="01_motu-828-interface",
    labels=("MOTU 828", "One Rack Unit"),
    head=("INTER", "FACE"),
    hero="M828-02", hero_mode="block",
    band="M828-40", band_mode="scene", band_pos="center",
    plates=["M828-32", "M828-36", "M828-39", "M828-20", "M828-44", "M828-42", "M828-10"],
    cap_title=("One rack ", "unit"),
    cap_body="A single rack space with the connectors on the back, the controls "
             "and a colour meter display on the front, and a large monitor knob "
             "at the right-hand end of the panel.",
    cap_meta="Above &mdash; three-quarter",
    band_meta="Below &mdash; lit on black",
),
"02": dict(
    name="02_motu-828-front-panel",
    labels=("Front Panel", "Mic &amp; Instrument"),
    head=("PRE", "AMPS"),
    hero="M828-23", hero_mode="block",
    band="M828-26", band_mode="scene", band_pos="center",
    plates=["M828-01", "M828-31", "M828-41", "M828-36", "M828-32"],
    cap_title=("In at the ", "front"),
    cap_body="The left of the panel carries the line inputs with a send and "
             "return pair marked for a mic insert &mdash; the point where an "
             "outboard preamp or a compressor patches into the signal.",
    cap_meta="Above &mdash; the input section",
    band_meta="Below &mdash; a microphone in front of it",
),
"03": dict(
    name="03_motu-828-rear-panel",
    labels=("Rear Panel", "Analog &amp; Digital"),
    head=("CONNEC", "TORS"),
    hero="M828-38", hero_mode="block",
    band="M828-42", band_mode="scene", band_pos="center",
    plates=["M828-44", "M828-37", "M828-03", "M828-35", "M828-01"],
    cap_title=("Out the ", "back"),
    cap_body="The whole back panel in one run &mdash; the balanced analog "
             "outputs, the digital pairs and the optical banks side by side "
             "rather than split across two rows.",
    cap_meta="Above &mdash; the rear panel",
    band_meta="Below &mdash; the rear, from the side",
),
"04": dict(
    name="04_motu-828-optical",
    labels=("Optical", "S/PDIF &middot; MIDI"),
    head=("DIG", "ITAL"),
    hero="M828-03", hero_mode="block",
    band="M828-35", band_mode="scene", band_pos="center",
    plates=["M828-37", "M828-38", "M828-44", "M828-19", "M828-34"],
    cap_title=("Light and ", "coax"),
    cap_body="Two optical banks marked OUT and IN for A and B, an S/PDIF pair "
             "on coax, and MIDI in and out &mdash; the digital side of the panel, "
             "with the USB port beneath it.",
    cap_meta="Above &mdash; the optical bank",
    band_meta="Below &mdash; the same section, closer",
),
"05": dict(
    name="05_motu-828-metering",
    labels=("The Display", "Phones &middot; In &middot; Out"),
    head=("MET", "ERING"),
    hero="M828-31", hero_mode="block",
    band="M828-41", band_mode="scene", band_pos="center",
    plates=["M828-45", "M828-28", "M828-16", "M828-11", "M828-13"],
    cap_title=("Read on the ", "panel"),
    cap_body="A colour screen on the front reads phones, input, output and "
             "monitor as four separate meter blocks, so levels are visible "
             "without bringing the software forward.",
    cap_meta="Above &mdash; the meter display",
    band_meta="Below &mdash; the same screen, running",
),
"06": dict(
    name="06_motu-828-latency",
    labels=("Round Trip", "USB"),
    head=("LAT", "ENCY"),
    hero="M828-12", hero_mode="block",
    band="M828-29", band_mode="scene", band_pos="center",
    plates=["M828-34", "M828-06", "M828-08", "M828-30", "M828-19"],
    cap_title=("There and ", "back"),
    cap_body="MOTU's drawing of the path &mdash; analog in, over USB to the "
             "workstation and back out. The round-trip figure printed on it is "
             "about two milliseconds.",
    cap_meta="Above &mdash; MOTU's latency diagram",
    band_meta="Below &mdash; with a laptop",
),
"07": dict(
    name="07_motu-828-cuemix",
    labels=("CueMix", "Onboard Mixer"),
    head=("MIX", "ING"),
    hero="M828-13", hero_mode="block",
    band="M828-11", band_mode="scene", band_pos="center",
    plates=["M828-16", "M828-46", "M828-19", "M828-28", "M828-45"],
    cap_title=("Mixing on the ", "box"),
    cap_body="The mixer runs on the interface rather than in the session &mdash; "
             "a device page with the unit drawn at the top, a full set of "
             "faders, and a routing list naming every input the box can see.",
    cap_meta="Above &mdash; the device page",
    band_meta="Below &mdash; the fader view",
),
"08": dict(
    name="08_motu-828-channel-strip",
    labels=("Channel Strip", "Gate &middot; Comp &middot; EQ"),
    head=("EFF", "ECTS"),
    hero="M828-07", hero_mode="block",
    band="M828-09", band_mode="scene", band_pos="center",
    plates=["M828-15", "M828-16", "M828-11", "M828-13", "M828-46"],
    cap_title=("On the way ", "in"),
    cap_body="Processing on each input, drawn as curves rather than numbers "
             "&mdash; a gate and a compressor with their thresholds and ratios, "
             "a parametric EQ, and a reverb the whole mixer can feed.",
    cap_meta="Above &mdash; gate and compressor",
    band_meta="Below &mdash; the parametric EQ",
),
"09": dict(
    name="09_motu-828-monitoring",
    labels=("Monitor Group", "A / B &middot; Talk"),
    head=("TALK", "BACK"),
    hero="M828-45", hero_mode="block",
    band="M828-28", band_mode="scene", band_pos="center",
    plates=["M828-31", "M828-41", "M828-13", "M828-16", "M828-01"],
    cap_title=("Two sets of ", "speakers"),
    cap_body="A monitor group with A and B select, mono and mute, and a talk "
             "button &mdash; the controls for checking a mix on a second pair "
             "and speaking to the room, kept together.",
    cap_meta="Above &mdash; the monitor buttons",
    band_meta="Below &mdash; the monitor group panel",
),
"10": dict(
    name="10_motu-828-in-service",
    labels=("In The Room", "Desks &amp; Amps"),
    head=("STU", "DIOS"),
    hero="M828-17", hero_mode="block",
    band="M828-33", band_mode="scene", band_pos="center",
    plates=["M828-22", "M828-29", "M828-30", "M828-26", "M828-27",
            "M828-05", "M828-14", "M828-21"],
    cap_title=("Rooms, not ", "sweeps"),
    cap_body="The frames shot where the unit works &mdash; on a crate beside a "
             "guitar amp, under a pair of monitors on a studio desk, next to a "
             "synth and a modular rack, with a footswitch on the floor.",
    cap_meta="Above &mdash; with a guitar and an amp",
    band_meta="Below &mdash; a control room",
),
}

# Nothing is matted or bbox-trimmed: every product frame here is lit on black,
# and the matte keys on a white sweep. All frames go in whole.
PREP = {}

# Other companies' artwork rather than photographs of this product. Held back
# under the same ruling that kept the Dante certification mark off the
# Sonicview slides.
HELD_BACK = {
    "M828-04": "collage of bundled third-party instrument thumbnails",
    "M828-18": "ESS Technology component mark",
    "M828-24": "Loopmasters bundle cover",
    "M828-25": "Lucid Samples bundle cover",
    "M828-43": "Big Fish Audio bundle cover",
}
