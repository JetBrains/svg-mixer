import {decl} from 'postcss';
import {Node, Tree, TreeEachCallback} from "postsvg";

declare namespace htmlparser2 {
  type ParserOptions = {
    xmlMode: boolean;
    lowerCaseTags: boolean;
    decodeEntities: boolean;
    lowerCaseAttributeNames: boolean;
    recognizeCDATA: boolean;
    recognizeSelfClosing: boolean;
  };
}

declare namespace posthtml {
  type Matcher = {
    tag?: string | RegExp;
    attrs?: Object;
  }
}

declare function postsvg(plugins?: postsvg.Plugin[]): postsvg.Processor;

declare namespace postsvg {
  type Node = {
    tag: string;
    attrs?: Object;
    content?: Node[];
  }

  type Plugin = (tree: Tree) => Tree;
  type TreeEachCallback = (node: Node) => void;

  interface Parser {
    (input: string, opts?: htmlparser2.ParserOptions): Tree;
  }

  interface Renderer {
    (tree: Tree): string;
  }

  class Result {
    constructor(tree: Tree);
    get html(): string;
    get svg(): string;
    get tree(): Tree;
    toString(): string;
  }

  type ProcessorOptions = {
    sync: boolean;
    parser: Parser;
    render: Renderer;
    skipParse: boolean;
  };

  function parse<Parser>();
  function render<Renderer>();

  class Processor {
    constructor(plugins?: Plugin[]);
    version: string;
    name: string;
    messages: Array;
    use(...plugins: Plugin[]): this;
    process(ast: string | Tree, options?: ProcessorOptions): Promise<Result>;
  }

  class Tree extends Array {
    static createFromArray(array: Array): Tree;
    get root(): Node;
    toString(): string;
    clone(): Tree;
    match(expression: posthtml.Matcher, callback: (node: Node) => Node);
    walk(callback: (node: Node) => Node);
    select(selector: string): Node[];
    each(selector: string | TreeEachCallback, callack?: TreeEachCallback): Node[];
  }
}

export = postsvg;
