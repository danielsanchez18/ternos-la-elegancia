import {
  InputFieldType,
  MeasurementGarmentType,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

type MeasurementFieldSeed = {
  garmentType: MeasurementGarmentType;
  code: string;
  label: string;
  sortOrder: number;
};

type CustomizationDefinitionSeed = {
  garmentType: MeasurementGarmentType;
  code: string;
  label: string;
  inputType: InputFieldType;
  sortOrder: number;
  allowFreeText?: boolean;
  options?: Array<{ code: string; label: string; sortOrder: number }>;
};

const measurementFields: MeasurementFieldSeed[] = [
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "back_length_measure", label: "Talle de espalda", sortOrder: 1 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "total_length", label: "Largo total", sortOrder: 2 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "half_back_width", label: "Media espalda", sortOrder: 3 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "chest_circumference", label: "Contorno de pecho", sortOrder: 4 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "waist_circumference", label: "Contorno de cintura", sortOrder: 5 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "hip_circumference", label: "Contorno de cadera", sortOrder: 6 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "shoulder_length", label: "Hombro", sortOrder: 7 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "sleeve_length", label: "Largo de manga", sortOrder: 8 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "cuff_circumference", label: "Contorno de puno", sortOrder: 9 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "arm_circumference", label: "Contorno de brazo", sortOrder: 10 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "forearm_circumference", label: "Cont. de antebrazo", sortOrder: 11 },

  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "total_length", label: "Largo total", sortOrder: 1 },
  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "inseam_length", label: "Entrepierna", sortOrder: 2 },
  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "waist_circumference", label: "Cintura", sortOrder: 3 },
  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "hip_circumference", label: "Cadera", sortOrder: 4 },
  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "knee_width", label: "Rodilla", sortOrder: 5 },
  { garmentType: MeasurementGarmentType.PANTALON_CABALLERO, code: "hem_width", label: "Bota", sortOrder: 6 },

  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "bust_height", label: "Altura de busto", sortOrder: 1 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "front_body_length_measure", label: "Talle delantero", sortOrder: 2 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "front_length", label: "Largo delantero", sortOrder: 3 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "back_body_length_measure", label: "Talle de espalda", sortOrder: 4 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "half_back_width", label: "Media espalda", sortOrder: 5 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "bust_circumference", label: "Contorno de busto", sortOrder: 6 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "waist_circumference", label: "Contorno cintura", sortOrder: 7 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "hip_circumference", label: "Contorno cadera", sortOrder: 8 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "side_height", label: "Altura de costado", sortOrder: 9 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "first_button_height", label: "Altura de 1o boton", sortOrder: 10 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "yoke_width", label: "Ancho canezu", sortOrder: 11 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "shoulder_length", label: "Hombro", sortOrder: 12 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "sleeve_length", label: "Largo manga", sortOrder: 13 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "bust_separation", label: "Separacion busto", sortOrder: 14 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "chest_width", label: "Ancho pecho", sortOrder: 15 },

  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "total_length", label: "Largo total", sortOrder: 1 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "inseam_length", label: "Entrepierna", sortOrder: 2 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "waist_circumference", label: "Cintura", sortOrder: 3 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "hip_circumference", label: "Cadera", sortOrder: 4 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "knee_width", label: "Rodilla", sortOrder: 5 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "hem_width", label: "Bota", sortOrder: 6 },
  { garmentType: MeasurementGarmentType.PANTALON_DAMA, code: "waistband_width", label: "Pretina", sortOrder: 7 },

  { garmentType: MeasurementGarmentType.FALDA, code: "skirt_length", label: "Largo", sortOrder: 1 },
  { garmentType: MeasurementGarmentType.FALDA, code: "waist_circumference", label: "Cont. cintura", sortOrder: 2 },
  { garmentType: MeasurementGarmentType.FALDA, code: "hip_circumference", label: "Cont. cadera", sortOrder: 3 },
  { garmentType: MeasurementGarmentType.FALDA, code: "high_hip_height", label: "Alto cadera", sortOrder: 4 },
  { garmentType: MeasurementGarmentType.FALDA, code: "waistband_width", label: "Pretina", sortOrder: 5 },
];

const customizationDefinitions: CustomizationDefinitionSeed[] = [
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "model",
    label: "Modelo",
    inputType: InputFieldType.SELECT,
    sortOrder: 1,
    options: [
      { code: "classic_no_pleats", label: "Pantalon clasico sin pinzas", sortOrder: 1 },
      { code: "two_pleats_with_adjustment", label: "Pantalon con 2 pinzas con ajuste", sortOrder: 2 },
      { code: "three_pleats_with_adjustment", label: "Pantalon con 3 pinzas con ajuste", sortOrder: 3 },
      { code: "two_inverted_pleats", label: "Pantalon con 2 pinzas invertidos", sortOrder: 4 },
      { code: "three_inverted_pleats", label: "Pantalon con 3 pinzas invertidos", sortOrder: 5 },
      { code: "one_pleat_normal_or_inverted", label: "Pantalon con 1 pinzas normal o invert.", sortOrder: 6 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "fabric_type",
    label: "Tejido",
    inputType: InputFieldType.SELECT,
    sortOrder: 2,
    options: [
      { code: "lanilla_barrington", label: "Lanilla Barrington", sortOrder: 1 },
      { code: "casimir_barrington", label: "Casimir Barrington", sortOrder: 2 },
      { code: "fifty_fifty", label: "Fifty Fifty", sortOrder: 3 },
      { code: "lanilla_cardif", label: "Lanilla Cardif", sortOrder: 4 },
      { code: "cardif_liviano", label: "Cardif Liviano", sortOrder: 5 },
      { code: "wool_english_satin_brushed", label: "Lan. Ing. Sat. Labrado", sortOrder: 6 },
      { code: "wool_english_satin_plain", label: "Lan. Ing. Sat. Llano", sortOrder: 7 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "cut",
    label: "Corte",
    inputType: InputFieldType.SELECT,
    sortOrder: 3,
    options: [
      { code: "italian", label: "Corte italiano", sortOrder: 1 },
      { code: "french", label: "Frances", sortOrder: 2 },
      { code: "american", label: "Americano", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "waistband_closure",
    label: "Cierre pretina",
    inputType: InputFieldType.SELECT,
    sortOrder: 4,
    options: [
      { code: "centered", label: "Centrado", sortOrder: 1 },
      { code: "centered_no_button", label: "Centrado sin boton", sortOrder: 2 },
      { code: "shifted", label: "Desplazado", sortOrder: 3 },
      { code: "shifted_no_button", label: "Desplazado sin boton", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "front_pockets",
    label: "Bolsillos delanteros",
    inputType: InputFieldType.SELECT,
    sortOrder: 5,
    options: [
      { code: "italian", label: "Italiano", sortOrder: 1 },
      { code: "american", label: "Americano", sortOrder: 2 },
      { code: "french", label: "Frances", sortOrder: 3 },
      { code: "other", label: "Otro", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_CABALLERO,
    code: "back_pockets",
    label: "Bolsillos traseros",
    inputType: InputFieldType.SELECT,
    sortOrder: 6,
    options: [
      { code: "none", label: "Sin", sortOrder: 1 },
      { code: "double_welt_button", label: "Doble vivo y boton", sortOrder: 2 },
      { code: "patch", label: "Parche", sortOrder: 3 },
      { code: "flap", label: "Solapa", sortOrder: 4 },
    ],
  },

  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "model",
    label: "Modelo",
    inputType: InputFieldType.SELECT,
    sortOrder: 1,
    options: [
      { code: "classic_no_pleats", label: "Pantalon clasico sin pliegues", sortOrder: 1 },
      { code: "with_pleats", label: "Pantalon con pliegues", sortOrder: 2 },
      { code: "with_belt_loops", label: "Pantalon con pasadores", sortOrder: 3 },
      { code: "without_belt_loops", label: "Pantalon sin pasadores", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "waistband_cross",
    label: "Pretina",
    inputType: InputFieldType.SELECT,
    sortOrder: 2,
    options: [
      { code: "no_cross", label: "Pretina sin cruce", sortOrder: 1 },
      { code: "crossed", label: "Pretina cruzada", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "fabric_type",
    label: "Tejido",
    inputType: InputFieldType.SELECT,
    sortOrder: 3,
    options: [
      { code: "lanilla_barrington", label: "Lanilla Barrington", sortOrder: 1 },
      { code: "casimir_barrington", label: "Casimir Barrington", sortOrder: 2 },
      { code: "fifty_fifty", label: "Fifty Fifty", sortOrder: 3 },
      { code: "lanilla_cardif", label: "Lanilla Cardif", sortOrder: 4 },
      { code: "cardif_liviano", label: "Cardif Liviano", sortOrder: 5 },
      { code: "wool_english_satin_brushed", label: "Lan. Ing. Sat. Labrado", sortOrder: 6 },
      { code: "wool_english_satin_plain", label: "Lan. Ing. Sat. Llano", sortOrder: 7 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "cut",
    label: "Corte",
    inputType: InputFieldType.SELECT,
    sortOrder: 4,
    options: [
      { code: "straight", label: "Recto", sortOrder: 1 },
      { code: "semi_pitillo", label: "Semipitillo", sortOrder: 2 },
      { code: "slim", label: "Slim", sortOrder: 3 },
      { code: "palazzo", label: "Palazo", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "waistband_closure",
    label: "Cierre pretina",
    inputType: InputFieldType.SELECT,
    sortOrder: 5,
    options: [
      { code: "centered", label: "Centrado", sortOrder: 1 },
      { code: "centered_no_button", label: "Cent. s/boton", sortOrder: 2 },
      { code: "shifted", label: "Desplazado", sortOrder: 3 },
      { code: "shifted_no_button", label: "Desp. s/boton", sortOrder: 4 },
      { code: "side", label: "Lateral", sortOrder: 5 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "front_pockets",
    label: "Bolsillos delanteros",
    inputType: InputFieldType.SELECT,
    sortOrder: 6,
    options: [
      { code: "rounded", label: "Redondeado", sortOrder: 1 },
      { code: "vertical", label: "Verticales", sortOrder: 2 },
      { code: "diagonal", label: "Diagonales", sortOrder: 3 },
      { code: "none_welt", label: "Sin de vivo", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.PANTALON_DAMA,
    code: "back_pockets",
    label: "Bolsillos traseros",
    inputType: InputFieldType.SELECT,
    sortOrder: 7,
    options: [
      { code: "none", label: "Sin", sortOrder: 1 },
      { code: "double_welt_button", label: "Doble vivo y boton", sortOrder: 2 },
      { code: "double_welt_no_button", label: "Doble vivo s/ boton", sortOrder: 3 },
      { code: "welt_button", label: "De vivo y boton", sortOrder: 4 },
      { code: "welt_no_button", label: "De vivo s/ boton", sortOrder: 5 },
    ],
  },

  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "fabric_type",
    label: "Tejido",
    inputType: InputFieldType.SELECT,
    sortOrder: 1,
    options: [
      { code: "lanilla_barrington", label: "Lanilla Barrington", sortOrder: 1 },
      { code: "casimir_barrington", label: "Casimir Barrington", sortOrder: 2 },
      { code: "fifty_fifty", label: "Fifty Fifty", sortOrder: 3 },
      { code: "lanilla_cardif", label: "Lanilla Cardif", sortOrder: 4 },
      { code: "cardif_liviano", label: "Cardif Liviano", sortOrder: 5 },
      { code: "wool_english_satin_brushed", label: "Lan. Ing. Sat. Labrado", sortOrder: 6 },
      { code: "wool_english_satin_plain", label: "Lan. Ing. Sat. Llano", sortOrder: 7 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "style",
    label: "Estilo",
    inputType: InputFieldType.SELECT,
    sortOrder: 2,
    options: [
      { code: "classic", label: "Clasico", sortOrder: 1 },
      { code: "crossed", label: "Cruzado", sortOrder: 2 },
      { code: "smoking", label: "Smoking", sortOrder: 3 },
      { code: "blazer", label: "Blazer", sortOrder: 4 },
      { code: "mao", label: "Mao", sortOrder: 5 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "lapel_type",
    label: "Tipo de solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 3,
    options: [
      { code: "classic", label: "Clasico", sortOrder: 1 },
      { code: "pointed", label: "En punta", sortOrder: 2 },
      { code: "smoking", label: "T. smoking", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "lapel_width",
    label: "Ancho solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 4,
    options: [
      { code: "narrow", label: "Estrecha", sortOrder: 1 },
      { code: "standard", label: "Standard", sortOrder: 2 },
      { code: "wide", label: "Ancha", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "chest_pocket",
    label: "Cartera pecho",
    inputType: InputFieldType.SELECT,
    sortOrder: 5,
    options: [
      { code: "yes", label: "Si", sortOrder: 1 },
      { code: "no", label: "No", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "pocket_style",
    label: "Bolsillos",
    inputType: InputFieldType.SELECT,
    sortOrder: 6,
    options: [
      { code: "flap", label: "Solapa", sortOrder: 1 },
      { code: "double_welt", label: "Dobl. vivo", sortOrder: 2 },
      { code: "patch", label: "Parches", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "pocket_type",
    label: "Tipo",
    inputType: InputFieldType.SELECT,
    sortOrder: 7,
    options: [
      { code: "standard", label: "Standard", sortOrder: 1 },
      { code: "inclined", label: "Inclinado", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "cut",
    label: "Corte",
    inputType: InputFieldType.SELECT,
    sortOrder: 8,
    options: [
      { code: "italian", label: "Italiano", sortOrder: 1 },
      { code: "english", label: "Ingles", sortOrder: 2 },
      { code: "american", label: "Americano", sortOrder: 3 },
      { code: "prince", label: "Principe", sortOrder: 4 },
      { code: "other", label: "Otro", sortOrder: 5 },
    ],
  },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "lining_distinction", label: "Forro interior", inputType: InputFieldType.TEXT, sortOrder: 9, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "button_color_distinction", label: "Color botones", inputType: InputFieldType.TEXT, sortOrder: 10, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "buttonhole_threads_distinction", label: "Ojales/Hilos", inputType: InputFieldType.TEXT, sortOrder: 11, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "lapel_application_color", label: "Solapa", inputType: InputFieldType.TEXT, sortOrder: 12, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "pockets_application_color", label: "Bolsillos", inputType: InputFieldType.TEXT, sortOrder: 13, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "chest_pocket_application_color", label: "Cartera pecho", inputType: InputFieldType.TEXT, sortOrder: 14, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "number_of_openings", label: "#Abertura", inputType: InputFieldType.NUMBER, sortOrder: 15 },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "number_of_buttons", label: "#Botones", inputType: InputFieldType.NUMBER, sortOrder: 16 },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "vest_style",
    label: "Chaleco estilo",
    inputType: InputFieldType.SELECT,
    sortOrder: 17,
    options: [
      { code: "simple", label: "Simple", sortOrder: 1 },
      { code: "crossed", label: "Cruzado", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "vest_lapel",
    label: "Chaleco solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 18,
    options: [
      { code: "none", label: "Sin", sortOrder: 1 },
      { code: "standard", label: "Estandar", sortOrder: 2 },
      { code: "pointed", label: "En punta", sortOrder: 3 },
      { code: "smoking", label: "Tipo smoking", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "vest_pockets",
    label: "Chaleco bolsillos",
    inputType: InputFieldType.SELECT,
    sortOrder: 19,
    options: [
      { code: "no", label: "No", sortOrder: 1 },
      { code: "yes_with_count", label: "Si #", sortOrder: 2 },
      { code: "one_welt", label: "Un vivo", sortOrder: 3 },
      { code: "two_welts", label: "Dos vivos", sortOrder: 4 },
      { code: "flap", label: "Tapa", sortOrder: 5 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "vest_chest_pocket",
    label: "Chaleco cartera pecho",
    inputType: InputFieldType.SELECT,
    sortOrder: 20,
    options: [
      { code: "no", label: "No", sortOrder: 1 },
      { code: "yes", label: "Si", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_CABALLERO,
    code: "vest_front_pocket_type",
    label: "T. bolsillos",
    inputType: InputFieldType.SELECT,
    sortOrder: 21,
    options: [
      { code: "standard", label: "Estandar", sortOrder: 1 },
      { code: "inclined", label: "Inclinado", sortOrder: 2 },
    ],
  },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "vest_inner_back_lining", label: "Forro int. y tras.", inputType: InputFieldType.TEXT, sortOrder: 22, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_CABALLERO, code: "vest_number_of_buttons", label: "Chaleco #botones", inputType: InputFieldType.NUMBER, sortOrder: 23 },

  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "fabric_type",
    label: "Tejido",
    inputType: InputFieldType.SELECT,
    sortOrder: 1,
    options: [
      { code: "lanilla_barrington", label: "Lanilla Barrington", sortOrder: 1 },
      { code: "casimir_barrington", label: "Casimir Barrington", sortOrder: 2 },
      { code: "fifty_fifty", label: "Fifty Fifty", sortOrder: 3 },
      { code: "lanilla_cardif", label: "Lanilla Cardif", sortOrder: 4 },
      { code: "cardif_liviano", label: "Cardif Liviano", sortOrder: 5 },
      { code: "wool_english_satin_brushed", label: "Lan. Ing. Sat. Labrado", sortOrder: 6 },
      { code: "wool_english_satin_plain", label: "Lan. Ing. Sat. Llano", sortOrder: 7 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "style",
    label: "Estilo",
    inputType: InputFieldType.SELECT,
    sortOrder: 2,
    options: [
      { code: "classic", label: "Clasico", sortOrder: 1 },
      { code: "crossed", label: "Cruzado", sortOrder: 2 },
      { code: "smoking", label: "Smoking", sortOrder: 3 },
      { code: "blazer", label: "Blazer", sortOrder: 4 },
      { code: "mao", label: "Mao", sortOrder: 5 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "lapel_type",
    label: "Tipo de solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 3,
    options: [
      { code: "classic", label: "Clasico", sortOrder: 1 },
      { code: "pointed", label: "En punta", sortOrder: 2 },
      { code: "smoking", label: "T. Smoking", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "lapel_width",
    label: "Ancho solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 4,
    options: [
      { code: "narrow", label: "Estrecha", sortOrder: 1 },
      { code: "standard", label: "Standard", sortOrder: 2 },
      { code: "wide", label: "Ancha", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "chest_pocket",
    label: "Cartera pecho",
    inputType: InputFieldType.SELECT,
    sortOrder: 5,
    options: [
      { code: "yes", label: "Si", sortOrder: 1 },
      { code: "no", label: "No", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "pocket_style",
    label: "Bolsillos",
    inputType: InputFieldType.SELECT,
    sortOrder: 6,
    options: [
      { code: "flap", label: "Solapa", sortOrder: 1 },
      { code: "double_welt", label: "Dobl. vivo", sortOrder: 2 },
      { code: "patch", label: "Parches", sortOrder: 3 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "pocket_type",
    label: "Tipo",
    inputType: InputFieldType.SELECT,
    sortOrder: 7,
    options: [
      { code: "standard", label: "Standard", sortOrder: 1 },
      { code: "inclined", label: "Inclinado", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "cut",
    label: "Corte",
    inputType: InputFieldType.SELECT,
    sortOrder: 8,
    options: [
      { code: "princess_bust_back", label: "Corte princesa pecho - espalda", sortOrder: 1 },
      { code: "princess_shoulder_back", label: "Corte princesa hombro - espalda", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "finish",
    label: "Acabado",
    inputType: InputFieldType.SELECT,
    sortOrder: 9,
    options: [
      { code: "rounded", label: "Redondeado", sortOrder: 1 },
      { code: "straight", label: "Recto", sortOrder: 2 },
      { code: "open", label: "Abierto", sortOrder: 3 },
    ],
  },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "lining_distinction", label: "Forro interior", inputType: InputFieldType.TEXT, sortOrder: 10, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "button_color_distinction", label: "Color botones", inputType: InputFieldType.TEXT, sortOrder: 11, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "buttonhole_threads_distinction", label: "Ojales/Hilos", inputType: InputFieldType.TEXT, sortOrder: 12, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "lapel_application_color", label: "Solapa", inputType: InputFieldType.TEXT, sortOrder: 13, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "pockets_application_color", label: "Bolsillos", inputType: InputFieldType.TEXT, sortOrder: 14, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "chest_pocket_application_color", label: "Cartera pecho", inputType: InputFieldType.TEXT, sortOrder: 15, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "number_of_openings", label: "#Aberturas", inputType: InputFieldType.NUMBER, sortOrder: 16 },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "number_of_buttons", label: "#Botones", inputType: InputFieldType.NUMBER, sortOrder: 17 },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "vest_style",
    label: "Chaleco estilo",
    inputType: InputFieldType.SELECT,
    sortOrder: 18,
    options: [
      { code: "simple", label: "Simple", sortOrder: 1 },
      { code: "crossed", label: "Cruzado", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "vest_lapel",
    label: "Chaleco solapa",
    inputType: InputFieldType.SELECT,
    sortOrder: 19,
    options: [
      { code: "none", label: "Sin", sortOrder: 1 },
      { code: "classic", label: "Clasica", sortOrder: 2 },
      { code: "pointed", label: "En punta", sortOrder: 3 },
      { code: "smoking", label: "T. Smoking", sortOrder: 4 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "vest_pockets",
    label: "Chaleco bolsillos",
    inputType: InputFieldType.SELECT,
    sortOrder: 20,
    options: [
      { code: "no", label: "No", sortOrder: 1 },
      { code: "yes_with_count", label: "Si #", sortOrder: 2 },
      { code: "one_welt", label: "Un vivo", sortOrder: 3 },
      { code: "two_welts", label: "Dos vivos", sortOrder: 4 },
      { code: "flap", label: "Tapa", sortOrder: 5 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "vest_chest_pocket",
    label: "Cartera pecho",
    inputType: InputFieldType.SELECT,
    sortOrder: 21,
    options: [
      { code: "no", label: "No", sortOrder: 1 },
      { code: "yes", label: "Si", sortOrder: 2 },
    ],
  },
  {
    garmentType: MeasurementGarmentType.SACO_DAMA,
    code: "vest_front_pocket_type",
    label: "Tipo de bo.",
    inputType: InputFieldType.SELECT,
    sortOrder: 22,
    options: [
      { code: "standard", label: "Estandar", sortOrder: 1 },
      { code: "inclined", label: "Inclinado", sortOrder: 2 },
    ],
  },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "vest_inner_back_lining", label: "Forro int. y post.", inputType: InputFieldType.TEXT, sortOrder: 23, allowFreeText: true },
  { garmentType: MeasurementGarmentType.SACO_DAMA, code: "vest_number_of_buttons", label: "#Botones", inputType: InputFieldType.NUMBER, sortOrder: 24 },
];

function definitionCode(garmentType: MeasurementGarmentType, code: string) {
  return `${garmentType.toLowerCase()}__${code}`;
}

function optionCode(garmentType: MeasurementGarmentType, definitionCodeValue: string, code: string) {
  return `${garmentType.toLowerCase()}__${definitionCodeValue}__${code}`;
}

async function seedMeasurementFields() {
  for (const field of measurementFields) {
    await prisma.measurementField.upsert({
      where: {
        garmentType_code: {
          garmentType: field.garmentType,
          code: field.code,
        },
      },
      update: {
        label: field.label,
        unit: "cm",
        sortOrder: field.sortOrder,
        active: true,
      },
      create: {
        garmentType: field.garmentType,
        code: field.code,
        label: field.label,
        unit: "cm",
        sortOrder: field.sortOrder,
        active: true,
      },
    });
  }
}

async function seedCustomizations() {
  for (const definition of customizationDefinitions) {
    const stableCode = definitionCode(definition.garmentType, definition.code);

    const savedDefinition = await prisma.customizationDefinition.upsert({
      where: { code: stableCode },
      update: {
        label: definition.label,
        garmentType: definition.garmentType,
        inputType: definition.inputType,
        allowFreeText: definition.allowFreeText ?? false,
        isRequired: false,
        sortOrder: definition.sortOrder,
        active: true,
      },
      create: {
        code: stableCode,
        label: definition.label,
        garmentType: definition.garmentType,
        inputType: definition.inputType,
        allowFreeText: definition.allowFreeText ?? false,
        isRequired: false,
        sortOrder: definition.sortOrder,
        active: true,
      },
    });

    for (const option of definition.options ?? []) {
      const stableOptionCode = optionCode(
        definition.garmentType,
        definition.code,
        option.code
      );

      await prisma.customizationOption.upsert({
        where: {
          definitionId_code: {
            definitionId: savedDefinition.id,
            code: stableOptionCode,
          },
        },
        update: {
          label: option.label,
          sortOrder: option.sortOrder,
          active: true,
        },
        create: {
          definitionId: savedDefinition.id,
          code: stableOptionCode,
          label: option.label,
          sortOrder: option.sortOrder,
          active: true,
        },
      });
    }
  }
}

async function main() {
  await seedMeasurementFields();
  await seedCustomizations();
  console.log("Seed completed: MeasurementField, CustomizationDefinition, CustomizationOption");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
