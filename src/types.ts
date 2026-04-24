export type BlockType = 'text' | 'image' | 'dialogue' | 'table' | 'divider' | 'callout' | 'chat' | 'quest' | 'document' | 'graphic' | 'sfx';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  isSelf: boolean;
  time?: string;
}

export interface ChatBlock extends BaseBlock {
  type: 'chat';
  messages: ChatMessage[];
  title?: string; // e.g., Group Chat Name or Contact Name
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  desc: string;
}

export interface RpgStat {
  id: string;
  name: string;
  value: string;
  maxValue?: string;
  color?: string;
}

export interface QuestBlock extends BaseBlock {
  type: 'quest';
  mode?: 'quest' | 'inventory' | 'choice' | 'spell' | 'healthbar' | 'levelup' | 'newskill';
  title: string;
  description: string;
  objective: string;
  reward: string;
  status: 'new' | 'in_progress' | 'completed' | 'failed';
  inventoryItems?: InventoryItem[];
  stats?: RpgStat[];
  choices?: { id: string; text: string; votes?: number }[];
}

export interface DocumentBlock extends BaseBlock {
  type: 'document';
  docType: 'journal' | 'newspaper' | 'dossier' | 'epigraph' | 'vision' | 'timer' | 'chat' | 'subtext' | 'terminal' | 'rumor' | 'prophecy';
  docStyle?: string;
  title?: string;
  content: string;
  metadata?: string;
  messages?: ChatMessage[];
  items?: any[];
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string; // Will support basic HTML/markdown tags like <b>, <i>, <span color="...">
  style: 'normal' | 'h1' | 'h2' | 'quote';
  align: 'right' | 'center' | 'left';
  color?: string;
  fontFamily?: string;
  fontSize?: number; // Custom font size override
}

export interface ImageData {
  id: string;
  url: string;
  width?: number; // In pixels
  height?: number; // In pixels
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  images: ImageData[];
  align: 'right' | 'center' | 'left';
  borderRadius?: number;
  gap?: number;
}


export interface DialogueBlock extends BaseBlock {
  type: 'dialogue';
  text: string;
  avatarUrl: string;
  avatarSize?: number; // Size in pixels, undefined means default
  direction: 'rtl' | 'ltr'; // 'rtl' means avatar is on the right, speech points from right to left
  bubbleType: 'speech' | 'thought' | 'shout' | 'whisper' | 'electronic' | 'scared' | 'narrator' | 'system';
  bubbleColor?: string;
  fontFamily?: string;
  bubbleWidth?: number | 'auto';
  bubbleHeight?: number | 'auto';
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  columns: 1 | 2 | 3 | 4 | 5 | 6;
  rows: string[][];
  align?: 'right' | 'center' | 'left';
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  color?: string;
  thickness?: number;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  content: string;
  calloutType: 'flashback' | 'note' | 'warning' | 'info' | 'quote';
  backgroundColor?: string;
  textColor?: string;
}

export type GraphicType = 'evidence' | 'lineage' | 'scroll' | 'minimap' | 'journey' | 'atmosphere' | 'wanted';

export interface SfxBlock extends BaseBlock {
  type: 'sfx';
  sfxType: 'word' | 'symbol';
  text: string;
  colorStyle: string;
  align: 'left' | 'center' | 'right';
}

export interface GraphicBlock extends BaseBlock {
  type: 'graphic';
  graphicType: GraphicType;
  title?: string;
  content?: string;
  imageUrl?: string;
  items?: any[];
}

export type StoryBlock = TextBlock | ImageBlock | DialogueBlock | TableBlock | DividerBlock | CalloutBlock | ChatBlock | QuestBlock | DocumentBlock | GraphicBlock | SfxBlock;

export interface Chapter {
  id: string;
  title: string;
}

export interface ProjectPage {
  id: string;
  name: string;
  blocks: StoryBlock[];
  chapterId?: string; // Phase: organization
  backgroundImage?: string; // Phase: visuals #15
  backgroundOpacity?: number;
  isCover?: boolean;
  subplots?: string[]; // IDs of subplots this page belongs to
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string; // The primary avatar URL
  images?: { id: string, url: string, name?: string }[]; // The folder of character images
  details: string;
  backstory?: string;
  inventory?: string[];
  goal?: string;
  factionIds?: string[];
  familyIds?: string[]; // Allow character to be explicitly linked to families
  otherGroupIds?: string[]; // Allow linking to other custom divisions
  healthStatus?: string;
  role?: 'main' | 'secondary' | 'dead' | 'unappeared';
  
  // Refined Character Profile Fields (#1 Request)
  age?: string;
  fears?: string;
  enemies?: string; // Could be a text describing or listing enemy IDs
  level?: string;
  abilities?: { name: string, desc: string }[];
  beliefId?: string; // Reference to Religions/Beliefs
  language?: string; // Character language/beliefs string
  reminders?: string; // Text field for reminders / thoughts
  currentLocation?: string; // Text field to keep track of current location
}

export interface Faction {
  id: string;
  name: string;
  type: string; // 'مملكة' | 'نقابة' | 'فريق' | 'أخرى'
  emblemUrl?: string;
  leaderId?: string;
  memberIds?: string[];
  description?: string;
}

export interface WorldMapNode {
  id: string;
  name: string;
  type: 'kingdom' | 'city' | 'village';
  parentId?: string; // which city or kingdom it belongs to
  leader?: string;
  description?: string;
  borders?: string;
  // Enhanced Location Profile Fields
  imageUrl?: string;
  climate?: string;
  economy?: string;
  risks?: string;
  guilds?: string;
}

// Worldbuilding Types
export interface Lore {
  id: string;
  title: string;
  content: string;
  type?: 'general' | 'law' | 'currency' | 'secret' | 'economy';
}

export interface Relation {
  id: string;
  char1Id: string;
  char2Id: string;
  type: string; // e.g., 'enemies', 'friends', 'brother', 'father'
}

export interface PlanningItem {
  id: string;
  name: string;
  description: string;
  type: 'artifact' | 'power';
}

export interface KanbanCard {
  id: string;
  title: string;
  desc: string;
  status: 'todo' | 'doing' | 'done';
}

export interface Subplot {
  id: string;
  name: string;
  color: string;
}

export interface Location {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  climate?: string;
  ruler?: string;
  economy?: string;
  risks?: string;
  guilds?: string;
}

export interface DictionaryWord {
  id: string;
  word: string;
  meaning: string;
  notes?: string;
}

export interface AISettings {
  apiKeys: string[];
  imageApiKeys: string[];
  modelType: 'flash' | 'pro';
  modelName: string;
}

export interface Religion {
  id: string;
  name: string;
  description: string;
}

export interface Family {
  id: string;
  name: string;
  type: 'family' | 'tribe';
  description: string;
  members_notes?: string;
}

export interface PlotTwist {
  id: string;
  title: string;
  content: string;
}

export interface OtherGroup {
  id: string;
  name: string;
  description: string;
}

export interface FutureQuote {
  id: string;
  content: string;
  link?: string;
}

export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string; // e.g. "Year 125, Day 3" or simple date
  order: number;
  relatedCharacterIds?: string[];
  relatedLocationId?: string;
  isFlashback?: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  backgroundColor: string;
  pageWidth?: number;
  pageFormat?: 'A4' | 'A5' | 'B5' | 'Letter' | 'Manhwa' | 'Manga' | 'WebNovel' | 'Custom';
  pagePadding?: number;
  blockGap?: number;
  pages: ProjectPage[];
  characters: Character[];
  scenario: string;
  alternativeScenarios?: string[];
  
  // New Arrays for Worldbuilding & Organization
  chapters?: Chapter[];
  lore?: Lore[];
  events?: StoryEvent[];
  worldMap?: WorldMapNode[];
  factions?: Faction[];
  relations?: Relation[];
  kanban?: KanbanCard[];
  planningItems?: PlanningItem[];
  subplots?: Subplot[];
  locations?: Location[];
  dictionary?: DictionaryWord[];
  
  // Added based on new requests
  religions?: Religion[];
  families?: Family[];
  twists?: PlotTwist[];
  futureQuotes?: FutureQuote[];
  
  // Custom groupings
  otherGroups?: OtherGroup[];

  // Goals & Tracking
  dailyGoal?: number;
  wordCountHistory?: Record<string, number>;
}
