export type Priority = 'green' | 'orange' | 'red'

export type CatalogItem = {
  key: string
  label: string
  priority: Priority
  synonyms: string[]
  detectorLabels?: string[] // free-form labels the detector might return
  notes?: string
}

/**
 * Green: "Take!" (very useful)
 * Orange: "Take if have space!" (could help)
 * Red: "Leave behind!" (not helpful / unsafe)
 */
export const FIRST_AID_CATALOG: CatalogItem[] = [
  // --- GREEN (highly useful) ---
  { key: 'clean_cloth', label: 'Clean cloth / towel', priority: 'green',
    synonyms: ['cloth','towel','dish towel','rag','microfiber'],
    detectorLabels: ['towel','cloth','rag'],
    notes: 'Pressure bandage / wound cover (if clean).' },

  { key: 'plastic_wrap', label: 'Plastic wrap', priority: 'green',
    synonyms: ['cling wrap','saran wrap','plastic wrap'],
    detectorLabels: ['plastic wrap','cling film','wrap'],
    notes: 'Occlusive dressing for burns/wounds (do not wrap tightly on burns).' },

  { key: 'zip_bag', label: 'Zip bag (for cold pack)', priority: 'green',
    synonyms: ['ziploc','zip bag','resealable bag','freezer bag'],
    detectorLabels: ['plastic bag','zip bag','ziploc'],
    notes: 'Ice pack with cold water/ice; general storage.' },

  { key: 'rubber_gloves', label: 'Rubber/Nitrile gloves', priority: 'green',
    synonyms: ['gloves','nitrile','latex'],
    detectorLabels: ['glove'],
    notes: 'Barrier protection.' },

  { key: 'saline_water', label: 'Clean water / saline', priority: 'green',
    synonyms: ['water','water bottle','bottle of water','saline'],
    detectorLabels: ['bottle','water bottle'],
    notes: 'Irrigation for wounds/eyes; hydration.' },

  { key: 'canned_food', label: 'Canned food', priority: 'green',
    synonyms: ['canned','can of beans','can of soup','tin food'],
    detectorLabels: ['can','tin'],
    notes: 'High shelf-life calories.' },

  { key: 'dry_food', label: 'Dry food (rice/pasta/grains)', priority: 'green',
    synonyms: ['rice','pasta','noodles','oats','flour bag (sealed food)'],
    detectorLabels: ['pasta','noodles','rice'],
    notes: 'Energy source (requires water/heat to cook).' },

  { key: 'energy_snacks', label: 'Bars/snacks (high-calorie)', priority: 'green',
    synonyms: ['energy bar','protein bar','granola bar','snack bar'],
    detectorLabels: ['bar'],
    notes: 'Immediate energy.' },

  { key: 'paper_towels', label: 'Paper towels (clean)', priority: 'green',
    synonyms: ['paper towel','kitchen roll','napkin'],
    detectorLabels: ['paper towel','napkin'],
    notes: 'Absorbent dressing/pressure (if clean).' },

  { key: 'tape', label: 'Tape (medical/athletic or clean masking)', priority: 'green',
    synonyms: ['tape','athletic tape','medical tape','masking tape'],
    detectorLabels: ['tape'],
    notes: 'Securing dressings/splints (avoid duct tape on skin).' },

  { key: 'trash_bag', label: 'Clean trash bag', priority: 'green',
    synonyms: ['garbage bag','trash bag'],
    detectorLabels: ['plastic bag'],
    notes: 'Barrier/ground cover/poncho/waterproofing.' },

  { key: 'blanket', label: 'Blanket', priority: 'green',
    synonyms: ['blanket','throw'],
    detectorLabels: ['blanket'],
    notes: 'Prevent hypothermia/shock.' },

  { key: 'backpack', label: 'Backpack / bag', priority: 'green',
    synonyms: ['backpack','bag','knapsack','rucksack'],
    detectorLabels: ['backpack','bag'],
    notes: 'Carry supplies and organize kit.' },

  { key: 'pot_pan', label: 'Pot / pan (cookware)', priority: 'green',
    synonyms: ['pot','pan','saucepan','skillet'],
    detectorLabels: ['pot','pan'],
    notes: 'Boil water for sterilization; cook food.' },

  { key: 'lighter', label: 'Lighter / matches', priority: 'green',
    synonyms: ['lighter','matches','matchbox'],
    detectorLabels: ['lighter','matchbox'],
    notes: 'Heat, sterilization (flame), signaling. Use safely.' },

  { key: 'person', label: 'Person (save every person)', priority: 'green',
    synonyms: ['person','people','human','man','woman','boy','girl','adult','child','kid','baby'],
    detectorLabels: ['person','people','man','woman','boy','girl','face','human'],
    notes: 'Human life has highest priority — alert, assist, and evacuate.' },

  // --- SHARP OBJECTS => GREEN (TAKE) ---
  { key: 'knife', label: 'Knives / sharp blades', priority: 'green',
    synonyms: ['knife','chef knife','blade','paring knife'],
    detectorLabels: ['knife'],
    notes: 'Cutting clothing/bandage, utility, protection. Handle carefully.' },

  { key: 'scissors', label: 'Scissors', priority: 'green',
    synonyms: ['scissor','kitchen scissors','shears'],
    detectorLabels: ['scissors'],
    notes: 'Cut dressings/clothes precisely.' },

  { key: 'can_opener', label: 'Can opener', priority: 'green',
    synonyms: ['can opener','tin opener'],
    detectorLabels: ['can opener'],
    notes: 'Access to canned food (calories!).' },

  { key: 'fork', label: 'Forks / pointed cutlery', priority: 'green',
    synonyms: ['fork','forks'],
    detectorLabels: ['fork'],
    notes: 'Improvised tool; can assist with dressing manipulation.' },

  { key: 'multitool', label: 'Multitool (with blade)', priority: 'green',
    synonyms: ['multitool','leatherman','swiss army knife'],
    detectorLabels: ['multitool'],
    notes: 'Versatile: cutting, gripping, small fixes.' },

  // --- ORANGE (useful if space allows; electronics, utilities) ---
  { key: 'elastic_band', label: 'Elastic band / hair tie', priority: 'orange',
    synonyms: ['elastic band','rubber band','hair tie'],
    detectorLabels: ['rubber band'],
    notes: 'Securing bandages/splints (not as tourniquet).' },

  { key: 'rigid_board', label: 'Cutting board / tray (splint base)', priority: 'orange',
    synonyms: ['cutting board','tray','baking sheet'],
    detectorLabels: ['cutting board','tray'],
    notes: 'Improvised splint/backing; pad edges.' },

  { key: 'tongs_tweezers', label: 'Tongs / tweezers', priority: 'orange',
    synonyms: ['tongs','tweezers'],
    detectorLabels: ['tongs','tweezer'],
    notes: 'Grasping without hands; clean before use.' },

  { key: 'laptop', label: 'Laptop / tablet', priority: 'orange',
    synonyms: ['laptop','tablet','ipad','computer'],
    detectorLabels: ['laptop','tablet'],
    notes: 'Information access; bulky but useful.' },

  { key: 'radio', label: 'Radio / walkie talkie', priority: 'orange',
    synonyms: ['radio','walkie talkie','transmitter'],
    detectorLabels: ['radio','walkie talkie'],
    notes: 'Emergency communication (power-dependent).' },

  { key: 'phone', label: 'Phone / smartphone', priority: 'orange',
    synonyms: ['phone','smartphone','cellphone','mobile'],
    detectorLabels: ['phone','cell phone'],
    notes: 'Navigation/communication if power exists.' },

  { key: 'battery_pack', label: 'Battery / power bank', priority: 'orange',
    synonyms: ['battery','power bank','portable charger'],
    detectorLabels: ['battery','powerbank'],
    notes: 'Portable power for devices.' },

  // --- RED (leave behind / not advised) ---
  { key: 'cooking_oil', label: 'Cooking oil', priority: 'red',
    synonyms: ['oil','olive oil','vegetable oil'],
    detectorLabels: ['bottle','oil bottle'],
    notes: 'Do NOT apply to burns/wounds.' },

  { key: 'flour_powder', label: 'Flour / powders', priority: 'red',
    synonyms: ['flour','cornstarch','powder'],
    detectorLabels: ['flour'],
    notes: 'Not for bleeding; can contaminate wounds.' },

  { key: 'string_tourniquet', label: 'Cords/belts as tourniquet', priority: 'red',
    synonyms: ['belt','cord','string'],
    detectorLabels: ['belt'],
    notes: 'Improvised tourniquets can cause harm if untrained.' },

  { key: 'mouse', label: 'Computer mouse', priority: 'red',
    synonyms: ['mouse','computer mouse'],
    detectorLabels: ['mouse'],
    notes: 'No use without computer or power.' },

  { key: 'keyboard', label: 'Keyboard', priority: 'red',
    synonyms: ['keyboard'],
    detectorLabels: ['keyboard'],
    notes: 'Completely useless without power.' },

  { key: 'book', label: 'Books / magazines', priority: 'red',
    synonyms: ['book','novel','magazine'],
    detectorLabels: ['book'],
    notes: 'Entertainment only; dead weight.' },

  { key: 'decor', label: 'Decorations / ornaments', priority: 'red',
    synonyms: ['decor','decoration','ornament','vase','painting','frame'],
    detectorLabels: ['decor','ornament','frame'],
    notes: 'No survival value.' },

  { key: 'furniture', label: 'Furniture / chairs / tables', priority: 'red',
    synonyms: ['chair','table','sofa','desk','couch','bed'],
    detectorLabels: ['chair','sofa','table','desk','couch'],
    notes: 'Too heavy, impractical.' },

  { key: 'curtains', label: 'Curtains / drapes', priority: 'red',
    synonyms: ['curtain','drape'],
    detectorLabels: ['curtain'],
    notes: 'Bulky, no essential use.' },

  { key: 'clock', label: 'Clock / wall clock', priority: 'red',
    synonyms: ['clock','alarm clock','wall clock'],
    detectorLabels: ['clock'],
    notes: 'No use beyond decoration.' },

  { key: 'tv', label: 'Television / monitor', priority: 'red',
    synonyms: ['tv','television','monitor','screen'],
    detectorLabels: ['tv','monitor'],
    notes: 'Heavy, power-dependent, useless.' },

  { key: 'fan', label: 'Electric fan', priority: 'red',
    synonyms: ['fan'],
    detectorLabels: ['fan'],
    notes: 'Power-dependent comfort only.' },

  { key: 'plate', label: 'Plates / dishes', priority: 'red',
    synonyms: ['plate','dish','mug','cup'],
    detectorLabels: ['plate','mug','cup'],
    notes: 'Low utility; fragile.' },

  { key: 'game', label: 'Games / consoles / entertainment', priority: 'red',
    synonyms: ['game','board game','console','controller','toy'],
    detectorLabels: ['controller','toy'],
    notes: 'Entertainment only.' },

  { key: 'mirror', label: 'Mirror', priority: 'red',
    synonyms: ['mirror'],
    detectorLabels: ['mirror'],
    notes: 'Fragile and heavy.' },

  { key: 'painting', label: 'Painting / wall art', priority: 'red',
    synonyms: ['painting','poster','art','frame'],
    detectorLabels: ['painting','poster'],
    notes: 'Decoration only.' },

  { key: 'pillow', label: 'Pillows / cushions', priority: 'red',
    synonyms: ['pillow','cushion'],
    detectorLabels: ['pillow','cushion'],
    notes: 'Comfort item, not essential.' },
]

// --- Mapping helper --- //
export function categorizeLabel(rawLabel: string): { priority: Priority; match?: CatalogItem } {
  const L = rawLabel.toLowerCase()
  // Strong match on detectorLabels then synonyms
  for (const it of FIRST_AID_CATALOG) {
    if (it.detectorLabels?.some(d => L.includes(d))) return { priority: it.priority, match: it }
  }
  for (const it of FIRST_AID_CATALOG) {
    if (it.synonyms.some(s => L.includes(s))) return { priority: it.priority, match: it }
  }
  // Default anything unknown to RED (show it, but suggest leaving)
  return { priority: 'red', match: undefined }
}