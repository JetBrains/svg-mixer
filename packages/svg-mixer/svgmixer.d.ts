import postsvg from 'postsvg';

declare function svgmixer(glob: string | string[], config?: svgmixer.ICompilerConfig): Promise<svgmixer.CompilerResult>;

declare namespace svgmixer {
  type SpriteSymbolPosition = {
    width: SpriteValue;
    height: SpriteValue;
    aspectRatio: SpriteValue;
    left: SpriteValue;
    top: SpriteValue;
    bgSize: {
      width: SpriteValue;
      height: SpriteValue;
    };
    bgPosition: {
      left: SpriteValue;
      top: SpriteValue;
    };
  };

  type StringifiedSpriteSymbolPosition = {
    width: string;
    height: string;
    aspectRatio: string;
    left: string;
    top: string;
    bgSize: {
      width: string;
      height: string;
    };
    bgPosition: {
      left: string;
      top: string;
    };
  };

  interface ICompilerConfig {
    spriteConfig: SpriteConfig | StackSpriteConfig;
    spriteType: 'classic' | 'stack';
    spriteClass: Sprite | StackSprite;
    symbolClass: SpriteSymbol;
    generateSymbolId: (path: string, query: string = '') => string;
  }

  class Compiler {
    static readonly defaultConfig: ICompilerConfig;
    static create(config?: ICompilerConfig): Compiler;
    constructor(public config?: ICompilerConfig);
    get symbols(): SpriteSymbol[];
    addSymbol(symbol: SpriteSymbol): void;
    addSymbolFromFile(path: string): Promise;
    createSymbol(opts: { path: string, content: string, id?: string }): SpriteSymbol;
    compile(): Promise<CompilerResult>;
    glob(pattern: string | string[]): Promise;
  }

  class CompilerResult {
    constructor(public content: string, public sprite: Sprite);
    get filename(): string;
    write(path: string): Promise;
  }

  class Image {
    constructor(path: string, content: string);
    path: string;
    query: string;
    get viewBox(): number[] | undefined;
    get width(): number | undefined;
    get height(): number | undefined;
    get content(): string;
    get tree(): postsvg.Tree;
    toString(): string;
  }

  interface SpriteConfig {
    filename: string;
    attrs: Object;
    usages: boolean;
    spacing: number;
  }

  class Sprite {
    static readonly defaultConfig: SpriteConfig;
    static readonly TYPE: 'classic' | 'stack';
    constructor(config?: SpriteConfig, symbols?: SpriteSymbol[]);
    get width(): number;
    get height(): number;
    get symbols(): SpriteSymbol[];
    addSymbol(symbol: SpriteSymbol): void;
    calculateSymbolPosition(symbol: SpriteSymbol, format?: boolean = false): SpriteSymbolPosition;
    calculateSymbolPosition(symbol: SpriteSymbol, format?: 'px' | 'percent'): StringifiedSpriteSymbolPosition;
    generate(): Promise<postsvg.Tree>;
    render(): Promise<string>;
  }

  class SpriteSymbol {
    constructor(public id: string, public image: Image);
    get width(): number | undefined;
    get height(): number | undefined;
    get viewBox(): number[] | undefined;
    generate(): Promise<postsvg.Tree>
    render(): Promise<string>;
  }

  class SpriteSymbolsMap extends Map {
    constructor(symbols?: SpriteSymbol[]);
    add(symbol: SpriteSymbol): this;
    toArray(): SpriteSymbol[];
  }

  class SpriteValue extends Number {
    static create(value: number, base: number): SpriteValue;
    constructor(value: number, public base: number);
    get factor(): number;
    toPx(decimalPlaces: number = 2): string;
    toPercent(decimalPlaces: number = 2): string;
  }

  interface StackSpriteConfig extends SpriteConfig {
    usageClassName: string;
    styles: string;
  }

  class StackSprite extends Sprite {
    static readonly defaultConfig: StackSpriteConfig;
    constructor(config?: StackSpriteConfig, symbols?: SpriteSymbol[]);
  }
}

export = svgmixer;
