# Fuente textual para seeds desde fichas técnicas - Ternos La Elegancia

## Regla principal
Usar esta información como fuente para crear seeds en Prisma.

### Separación obligatoria
- `MeasurementField`: solo campos de la sección **MEDIDAS**
- `CustomizationDefinition` y `CustomizationOption`: secciones de configuración/estilo
- No usar como seeds campos transaccionales como cliente, contacto, fecha, entrega, hora.

### Convención
- `code`: en inglés técnico, estable, en snake_case
- `label`: en español, tal como se usa en la ficha
- `unit`: `"cm"` para medidas
- `sortOrder`: respetar el orden visual de la ficha
- `active`: `true`

---

# 1) MeasurementField

## SACO_CABALLERO
Campos de medidas:
1. code: `back_length_measure`, label: `Talle de espalda`
2. code: `total_length`, label: `Largo total`
3. code: `half_back_width`, label: `Media espalda`
4. code: `chest_circumference`, label: `Contorno de pecho`
5. code: `waist_circumference`, label: `Contorno de cintura`
6. code: `hip_circumference`, label: `Contorno de cadera`
7. code: `shoulder_length`, label: `Hombro`
8. code: `sleeve_length`, label: `Largo de manga`
9. code: `cuff_circumference`, label: `Contorno de puño`
10. code: `arm_circumference`, label: `Contorno de brazo`
11. code: `forearm_circumference`, label: `Cont. de antebrazo`

## PANTALON_CABALLERO
Campos de medidas:
1. code: `total_length`, label: `Largo total`
2. code: `inseam_length`, label: `Entrepierna`
3. code: `waist_circumference`, label: `Cintura`
4. code: `hip_circumference`, label: `Cadera`
5. code: `knee_width`, label: `Rodilla`
6. code: `hem_width`, label: `Bota`

## SACO_DAMA
Campos de medidas:
1. code: `bust_height`, label: `Altura de busto`
2. code: `front_body_length_measure`, label: `Talle delantero`
3. code: `front_length`, label: `Largo delantero`
4. code: `back_body_length_measure`, label: `Talle de espalda`
5. code: `half_back_width`, label: `Media espalda`
6. code: `bust_circumference`, label: `Contorno de busto`
7. code: `waist_circumference`, label: `Contorno cintura`
8. code: `hip_circumference`, label: `Contorno cadera`
9. code: `side_height`, label: `Altura de costado`
10. code: `first_button_height`, label: `Altura de 1° botón`
11. code: `yoke_width`, label: `Ancho canezú`
12. code: `shoulder_length`, label: `Hombro`
13. code: `sleeve_length`, label: `Largo manga`
14. code: `bust_separation`, label: `Separación busto`
15. code: `chest_width`, label: `Ancho pecho`

## PANTALON_DAMA
Campos de medidas:
1. code: `total_length`, label: `Largo total`
2. code: `inseam_length`, label: `Entrepierna`
3. code: `waist_circumference`, label: `Cintura`
4. code: `hip_circumference`, label: `Cadera`
5. code: `knee_width`, label: `Rodilla`
6. code: `hem_width`, label: `Bota`
7. code: `waistband_width`, label: `Pretina`

## FALDA
Campos de medidas:
1. code: `skirt_length`, label: `Largo`
2. code: `waist_circumference`, label: `Cont. cintura`
3. code: `hip_circumference`, label: `Cont. cadera`
4. code: `high_hip_height`, label: `Alto cadera`
5. code: `waistband_width`, label: `Pretina`

---

# 2) CustomizationDefinition / CustomizationOption

## PANTALON_CABALLERO

### Grupo: modelo
Definición:
- code: `model`
- label: `Modelo`
- inputType: `SELECT`

Opciones:
- `classic_no_pleats` => `Pantalón clásico sin pinzas`
- `two_pleats_with_adjustment` => `Pantalón con 2 pinzas con ajuste`
- `three_pleats_with_adjustment` => `Pantalón con 3 pinzas con ajuste`
- `two_inverted_pleats` => `Pantalón con 2 pinzas invertidos`
- `three_inverted_pleats` => `Pantalón con 3 pinzas invertidos`
- `one_pleat_normal_or_inverted` => `Pantalón con 1 pinzas normal o invert.`

### Grupo: tejido
Definición:
- code: `fabric_type`
- label: `Tejido`
- inputType: `SELECT`

Opciones:
- `lanilla_barrington` => `Lanilla Barrington`
- `casimir_barrington` => `Casimir Barrington`
- `fifty_fifty` => `Fifty Fifty`
- `lanilla_cardif` => `Lanilla Cardif`
- `cardif_liviano` => `Cardif Liviano`
- `wool_english_satin_brushed` => `Lan. Ing. Sat. Labrado`
- `wool_english_satin_plain` => `Lan. Ing. Sat. Llano`

### Grupo: corte
Definición:
- code: `cut`
- label: `Corte`
- inputType: `SELECT`

Opciones:
- `italian` => `Corte italiano`
- `french` => `Francés`
- `american` => `Americano`

### Grupo: waistband_closure
Definición:
- code: `waistband_closure`
- label: `Cierre pretina`
- inputType: `SELECT`

Opciones:
- `centered` => `Centrado`
- `centered_no_button` => `Centrado sin botón`
- `shifted` => `Desplazado`
- `shifted_no_button` => `Desplazado sin botón`

### Grupo: front_pockets
Definición:
- code: `front_pockets`
- label: `Bolsillos delanteros`
- inputType: `SELECT`

Opciones:
- `italian` => `Italiano`
- `american` => `Americano`
- `french` => `Francés`
- `other` => `Otro`

### Grupo: back_pockets
Definición:
- code: `back_pockets`
- label: `Bolsillos traseros`
- inputType: `SELECT`

Opciones:
- `none` => `Sin`
- `double_welt_button` => `Doble vivo y botón`
- `patch` => `Parche`
- `flap` => `Solapa`

---

## PANTALON_DAMA

### Grupo: modelo
Definición:
- code: `model`
- label: `Modelo`
- inputType: `SELECT`

Opciones:
- `classic_no_pleats` => `Pantalón clásico sin pliegues`
- `with_pleats` => `Pantalón con pliegues`
- `with_belt_loops` => `Pantalón con pasadores`
- `without_belt_loops` => `Pantalón sin pasadores`

### Grupo: waistband_cross
Definición:
- code: `waistband_cross`
- label: `Pretina`
- inputType: `SELECT`

Opciones:
- `no_cross` => `Pretina sin cruce`
- `crossed` => `Pretina cruzada`

### Grupo: tejido
Definición:
- code: `fabric_type`
- label: `Tejido`
- inputType: `SELECT`

Opciones:
- `lanilla_barrington` => `Lanilla Barrington`
- `casimir_barrington` => `Casimir Barrington`
- `fifty_fifty` => `Fifty Fifty`
- `lanilla_cardif` => `Lanilla Cardif`
- `cardif_liviano` => `Cardif Liviano`
- `wool_english_satin_brushed` => `Lan. Ing. Sat. Labrado`
- `wool_english_satin_plain` => `Lan. Ing. Sat. Llano`

### Grupo: corte
Definición:
- code: `cut`
- label: `Corte`
- inputType: `SELECT`

Opciones:
- `straight` => `Recto`
- `semi_pitillo` => `Semipitillo`
- `slim` => `Slim`
- `palazzo` => `Palazo`

### Grupo: waistband_closure
Definición:
- code: `waistband_closure`
- label: `Cierre pretina`
- inputType: `SELECT`

Opciones:
- `centered` => `Centrado`
- `centered_no_button` => `Cent. s/botón`
- `shifted` => `Desplazado`
- `shifted_no_button` => `Desp. s/botón`
- `side` => `Lateral`

### Grupo: front_pockets
Definición:
- code: `front_pockets`
- label: `Bolsillos delanteros`
- inputType: `SELECT`

Opciones:
- `rounded` => `Redondeado`
- `vertical` => `Verticales`
- `diagonal` => `Diagonales`
- `none_welt` => `Sin de vivo`

### Grupo: back_pockets
Definición:
- code: `back_pockets`
- label: `Bolsillos traseros`
- inputType: `SELECT`

Opciones:
- `none` => `Sin`
- `double_welt_button` => `Doble vivo y botón`
- `double_welt_no_button` => `Doble vivo s/ botón`
- `welt_button` => `De vivo y botón`
- `welt_no_button` => `De vivo s/ botón`

---

## SACO_CABALLERO

### Grupo: tejido
Definición:
- code: `fabric_type`
- label: `Tejido`
- inputType: `SELECT`

Opciones:
- `lanilla_barrington` => `Lanilla Barrington`
- `casimir_barrington` => `Casimir Barrington`
- `fifty_fifty` => `Fifty Fifty`
- `lanilla_cardif` => `Lanilla Cardif`
- `cardif_liviano` => `Cardif Liviano`
- `wool_english_satin_brushed` => `Lan. Ing. Sat. Labrado`
- `wool_english_satin_plain` => `Lan. Ing. Sat. Llano`

### Grupo: style
Definición:
- code: `style`
- label: `Estilo`
- inputType: `SELECT`

Opciones:
- `classic` => `Clásico`
- `crossed` => `Cruzado`
- `smoking` => `Smoking`
- `blazer` => `Blazer`
- `mao` => `Mao`

### Grupo: lapel_type
Definición:
- code: `lapel_type`
- label: `Tipo de solapa`
- inputType: `SELECT`

Opciones:
- `classic` => `Clásico`
- `pointed` => `En punta`
- `smoking` => `T. smoking`

### Grupo: lapel_width
Definición:
- code: `lapel_width`
- label: `Ancho solapa`
- inputType: `SELECT`

Opciones:
- `narrow` => `Estrecha`
- `standard` => `Standard`
- `wide` => `Ancha`

### Grupo: chest_pocket
Definición:
- code: `chest_pocket`
- label: `Cartera pecho`
- inputType: `SELECT`

Opciones:
- `yes` => `Sí`
- `no` => `No`

### Grupo: pocket_style
Definición:
- code: `pocket_style`
- label: `Bolsillos`
- inputType: `SELECT`

Opciones:
- `flap` => `Solapa`
- `double_welt` => `Dobl. vivo`
- `patch` => `Parches`

### Grupo: pocket_type
Definición:
- code: `pocket_type`
- label: `Tipo`
- inputType: `SELECT`

Opciones:
- `standard` => `Standard`
- `inclined` => `Inclinado`

### Grupo: cut
Definición:
- code: `cut`
- label: `Corte`
- inputType: `SELECT`

Opciones:
- `italian` => `Italiano`
- `english` => `Inglés`
- `american` => `Americano`
- `prince` => `Príncipe`
- `other` => `Otro`

### Grupo: distinction_lining
Definición:
- code: `lining_distinction`
- label: `Forro interior`
- inputType: `TEXT`

### Grupo: distinction_button_color
Definición:
- code: `button_color_distinction`
- label: `Color botones`
- inputType: `TEXT`

### Grupo: distinction_buttonhole_threads
Definición:
- code: `buttonhole_threads_distinction`
- label: `Ojales/Hilos`
- inputType: `TEXT`

### Grupo: application_lapel
Definición:
- code: `lapel_application_color`
- label: `Solapa`
- inputType: `TEXT`

### Grupo: application_pockets
Definición:
- code: `pockets_application_color`
- label: `Bolsillos`
- inputType: `TEXT`

### Grupo: application_chest_pocket
Definición:
- code: `chest_pocket_application_color`
- label: `Cartera pecho`
- inputType: `TEXT`

### Grupo: number_of_openings
Definición:
- code: `number_of_openings`
- label: `#Abertura`
- inputType: `NUMBER`

### Grupo: number_of_buttons
Definición:
- code: `number_of_buttons`
- label: `#Botones`
- inputType: `NUMBER`

### Grupo: vest_style
Definición:
- code: `vest_style`
- label: `Chaleco estilo`
- inputType: `SELECT`

Opciones:
- `simple` => `Simple`
- `crossed` => `Cruzado`

### Grupo: vest_lapel
Definición:
- code: `vest_lapel`
- label: `Chaleco solapa`
- inputType: `SELECT`

Opciones:
- `none` => `Sin`
- `standard` => `Estándar`
- `pointed` => `En punta`
- `smoking` => `Tipo smoking`

### Grupo: vest_pockets
Definición:
- code: `vest_pockets`
- label: `Chaleco bolsillos`
- inputType: `SELECT`

Opciones:
- `no` => `No`
- `yes_with_count` => `Sí #`
- `one_welt` => `Un vivo`
- `two_welts` => `Dos vivos`
- `flap` => `Tapa`

### Grupo: vest_chest_pocket
Definición:
- code: `vest_chest_pocket`
- label: `Chaleco cartera pecho`
- inputType: `SELECT`

Opciones:
- `no` => `No`
- `yes` => `Sí`

### Grupo: vest_front_pocket_type
Definición:
- code: `vest_front_pocket_type`
- label: `T. bolsillos`
- inputType: `SELECT`

Opciones:
- `standard` => `Estándar`
- `inclined` => `Inclinado`

### Grupo: vest_inner_back_lining
Definición:
- code: `vest_inner_back_lining`
- label: `Forro int. y tras.`
- inputType: `TEXT`

### Grupo: vest_number_of_buttons
Definición:
- code: `vest_number_of_buttons`
- label: `Chaleco #botones`
- inputType: `NUMBER`

---

## SACO_DAMA

### Grupo: tejido
Definición:
- code: `fabric_type`
- label: `Tejido`
- inputType: `SELECT`

Opciones:
- `lanilla_barrington` => `Lanilla Barrington`
- `casimir_barrington` => `Casimir Barrington`
- `fifty_fifty` => `Fifty Fifty`
- `lanilla_cardif` => `Lanilla Cardif`
- `cardif_liviano` => `Cardif Liviano`
- `wool_english_satin_brushed` => `Lan. Ing. Sat. Labrado`
- `wool_english_satin_plain` => `Lan. Ing. Sat. Llano`

### Grupo: style
Definición:
- code: `style`
- label: `Estilo`
- inputType: `SELECT`

Opciones:
- `classic` => `Clásico`
- `crossed` => `Cruzado`
- `smoking` => `Smoking`
- `blazer` => `Blazer`
- `mao` => `Mao`

### Grupo: lapel_type
Definición:
- code: `lapel_type`
- label: `Tipo de solapa`
- inputType: `SELECT`

Opciones:
- `classic` => `Clásico`
- `pointed` => `En punta`
- `smoking` => `T. Smoking`

### Grupo: lapel_width
Definición:
- code: `lapel_width`
- label: `Ancho solapa`
- inputType: `SELECT`

Opciones:
- `narrow` => `Estrecha`
- `standard` => `Standard`
- `wide` => `Ancha`

### Grupo: chest_pocket
Definición:
- code: `chest_pocket`
- label: `Cartera pecho`
- inputType: `SELECT`

Opciones:
- `yes` => `Sí`
- `no` => `No`

### Grupo: pocket_style
Definición:
- code: `pocket_style`
- label: `Bolsillos`
- inputType: `SELECT`

Opciones:
- `flap` => `Solapa`
- `double_welt` => `Dobl. vivo`
- `patch` => `Parches`

### Grupo: pocket_type
Definición:
- code: `pocket_type`
- label: `Tipo`
- inputType: `SELECT`

Opciones:
- `standard` => `Standard`
- `inclined` => `Inclinado`

### Grupo: cut
Definición:
- code: `cut`
- label: `Corte`
- inputType: `SELECT`

Opciones:
- `princess_bust_back` => `Corte princesa pecho - espalda`
- `princess_shoulder_back` => `Corte princesa hombro - espalda`

### Grupo: finish
Definición:
- code: `finish`
- label: `Acabado`
- inputType: `SELECT`

Opciones:
- `rounded` => `Redondeado`
- `straight` => `Recto`
- `open` => `Abierto`

### Grupo: distinction_lining
Definición:
- code: `lining_distinction`
- label: `Forro interior`
- inputType: `TEXT`

### Grupo: distinction_button_color
Definición:
- code: `button_color_distinction`
- label: `Color botones`
- inputType: `TEXT`

### Grupo: distinction_buttonhole_threads
Definición:
- code: `buttonhole_threads_distinction`
- label: `Ojales/Hilos`
- inputType: `TEXT`

### Grupo: application_lapel
Definición:
- code: `lapel_application_color`
- label: `Solapa`
- inputType: `TEXT`

### Grupo: application_pockets
Definición:
- code: `pockets_application_color`
- label: `Bolsillos`
- inputType: `TEXT`

### Grupo: application_chest_pocket
Definición:
- code: `chest_pocket_application_color`
- label: `Cartera pecho`
- inputType: `TEXT`

### Grupo: number_of_openings
Definición:
- code: `number_of_openings`
- label: `#Aberturas`
- inputType: `NUMBER`

### Grupo: number_of_buttons
Definición:
- code: `number_of_buttons`
- label: `#Botones`
- inputType: `NUMBER`

### Grupo: vest_style
Definición:
- code: `vest_style`
- label: `Chaleco estilo`
- inputType: `SELECT`

Opciones:
- `simple` => `Simple`
- `crossed` => `Cruzado`

### Grupo: vest_lapel
Definición:
- code: `vest_lapel`
- label: `Chaleco solapa`
- inputType: `SELECT`

Opciones:
- `none` => `Sin`
- `classic` => `Clásica`
- `pointed` => `En punta`
- `smoking` => `T. Smoking`

### Grupo: vest_pockets
Definición:
- code: `vest_pockets`
- label: `Chaleco bolsillos`
- inputType: `SELECT`

Opciones:
- `no` => `No`
- `yes_with_count` => `Sí #`
- `one_welt` => `Un vivo`
- `two_welts` => `Dos vivos`
- `flap` => `Tapa`

### Grupo: vest_chest_pocket
Definición:
- code: `vest_chest_pocket`
- label: `Cartera pecho`
- inputType: `SELECT`

Opciones:
- `no` => `No`
- `yes` => `Sí`

### Grupo: vest_front_pocket_type
Definición:
- code: `vest_front_pocket_type`
- label: `Tipo de bo.`
- inputType: `SELECT`

Opciones:
- `standard` => `Estándar`
- `inclined` => `Inclinado`

### Grupo: vest_inner_back_lining
Definición:
- code: `vest_inner_back_lining`
- label: `Forro int. y post.`
- inputType: `TEXT`

### Grupo: vest_number_of_buttons
Definición:
- code: `vest_number_of_buttons`
- label: `#Botones`
- inputType: `NUMBER`