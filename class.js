function isEqualCode(node, key) {
  return node[key][0].code === node[key][1].code;
}

class CustomLinked {
  data = [];
  constructor() {}

  poblate(data) {
    this.data = data;
  }

  exist(code) {
    const index = this.data.findIndex((v) => v.code === code);
    return index;
  }

  update(code, node) {
    const index = this.exist(code);
    if (index === -1) return;
    this.data = [
      ...this.data.filter((v) => v.code !== code && v.data !== node.data),
      node,
    ];
  }

  get(code) {
    if (!code) return this.data;
    return this.data.find((v) => v.code === code);
  }

  sort(key = null) {
    if (key === "asc") return this.data.sort((a, b) => a.code - b.code);
    return this.data.sort((a, b) => b.code - a.code);
  }

  add(params) {
    let { prev, next, code } = params;
    if (this.exist(code) > -1) {
      const node = this.get(code);
      this.validatePositions(params, node);
      //First position
      if (!prev && next) {
        this.replacePrev(params, node);
        this.findAndModifyNext(node, params.code);
        this.insert(params);
      }
      if (prev && !next) {
        this.insert(params);
      }
    }
    if (!prev && !next)
      throw new Error(
        "Invalid positions, it should have a prev and next values"
      );
    this.insert(params);
  }

  insert(node) {
    this.data.push(node);
  }

  replacePrev(params, node) {
    node.prev = [params?.next[0].code - 1];
    return params;
  }

  validatePositions(params, exist) {
    const { prev, next } = params;
    if (!prev?.length && exist.prev)
      throw new Error(
        "Invalid previous position",
        exist.prev,
        ", position sent",
        prev
      );
    if (!next?.length && exist.next)
      throw new Error(
        "Invalid next position, current position",
        exist.next,
        ", position sent",
        next
      );
  }

  regretion(nodes, currentNode) {
    const temp = [currentNode];
    nodes.forEach((v) => {
      const nextNode = this.get(v.code);
      if (!nextNode) return temp;
      if (temp.find((t) => t.code == nextNode.code)) return temp;
      temp.push(nextNode);
      if (nextNode.next?.length) {
        return this.regretion(nextNode.next);
      }
    });
    return temp;
  }

  findAndModifyNext(node, existCode = null) {
    if (!node) return null;
    const nodes = this.regretion(node.next, node);
    const sort = nodes.sort((a, b) => b.code - a.code);
    sort.forEach((v) => {
      this.update(v.code, {
        ...v,
        code: v.code + 1,
        next: v.next ? v.next.map((n) => ({ ...n, code: n.code + 1 })) : null,
        prev: v.code === existCode ? v.prev : v.prev?.map((n) => n + 1),
      });
    });
  }
}

const data = [
  {
    next: [
      { condition: false, code: 2 },
      { condition: true, code: 3 },
    ],
    prev: null,
    code: 1,
    data: {
      question:
        "El demandado es conviviente/ ex conviviente / cónyuge / padre/ hijo / hermando de la denunciante?",
      // next: ["2", "3"],
      variables: [
        {
          title: "Vinculo parte",
          key: "VINCULO_PARTE",
          required: true,
        },
      ],
      paragraph: [
        {
          key: "PARAGRAPH_1",
          value:
            "En cuando al vínculo familiar referido entre las partes, si bien no se encuentra expresamente contemplado en el artículo 7 de la ley Nº 30364, se valora que el sentido de la norma es proteger al grupo familiar, y que la Constitución Política del Perú en sus artículos 4 y 5 señala que protege a la familia y reconoce el hogar de hecho que se forma de la unión de un hombre y mujer, en tal sentido, aun cuando la convivencia no genera afinidad, se estima necesario homologar tal condición a los familiares de los convivientes y exconvivientes, en función de una interpretación extensiva, sin discriminación y conforme a la Constitución",
          condition: false,
        },
      ],
    },
  },
  {
    next: null,
    // next: [
    //   { condition: true, code: 3 },
    //   { condition: false, code: 3 },
    // ],
    prev: [1],
    code: 2,
    data: {
      question: "Existe relacion familiar?",
      variables: [],
      paragraph: [
        {
          key: "PARAGRAPH_2",
          condition: false,
          value:
            "En el presente caso, aun cuando entre las partes no existe una relación familiar, se debe efectuar una valoración de los hechos a fin de determinar si en el caso concreto los hechos denunciados califican como actos de violencia en contra de la mujer por su condición de tal, para ello se tendrá en cuenta adicionalmente y en forma concordada lo dispuesto en el artículo 4, numeral 3) del Reglamento de la Ley Nº 30364.",
        },
      ],
    },
  },
];

const instance = new CustomLinked();
instance.poblate(data);
instance.add({
  code: 1,
  prev: null,
  next: [
    { condition: false, code: 2 },
    { condition: true, code: 2 },
  ],
  data: {
    question: "Testing question",
    variables: [],
    paragraph: [],
  },
});

console.log(instance.get());
