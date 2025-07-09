
export enum BlockType {
  STRUCTURE = 'Structure',
  LYRICS = 'Lyrics',
  GENRE = 'Genre',
  MOOD = 'Mood & Atmosphere',
  DYNAMICS = 'Dynamics & Rhythm',
  PRODUCTION = 'Production Style',
  INSTRUMENTATION = 'Instrumentation',
  VOCALS = 'Vocals',
  TEMPO = 'Tempo',
  SOUND_EFFECT = 'Sound Effect',
  CUSTOM = 'Custom Tag',
}

export interface PromptBlock {
  id: string;
  type: BlockType;
  value: any;
}

// Types for Artist Bio Page
export enum BioBlockType {
    HEADER = 'Header',
    IMAGE = 'Image',
    TEXT = 'Text Block',
    LINKS = 'Links',
}

export interface Link {
    id: string;
    platform: string;
    url: string;
}

export interface BioBlock {
    id: string;
    type: BioBlockType;
    value: any;
}

// Types for Album Page
export enum AlbumBlockType {
    HEADER = 'Album Header',
    TRACKLIST = 'Tracklist',
}

export interface Track {
    id: string;
    title: string;
    url: string;
    fileName?: string;
}

export interface AlbumBlock {
    id: string;
    type: AlbumBlockType;
    value: any;
}


// Types for Settings
export type Theme = 'cyan' | 'rose' | 'emerald';

export interface Settings {
    theme: Theme;
    artistName: string;
    studioName: string;
    albumName: string;
    copyright: string;
    studioLogo: string | null;
    artistLogo: string | null;
    studioBio: string;
    studioWebsite: string;
    studioEmail: string;
    studioPhone: string;
    splashBackground: string | null;
    serverAddress: string;
}