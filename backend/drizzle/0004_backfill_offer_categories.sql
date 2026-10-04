UPDATE "offers"
SET "category" = CASE
  WHEN lower("title") LIKE ANY (ARRAY['%smartphone%','%celular%','%iphone%','%notebook%','%laptop%','%computador%','%monitor%','%televisão%','%televisao%','%smart tv%','%fone%','%headset%','%carregador%','%smartwatch%','%teclado%','%mouse%','%câmera%','%camera%','%tablet%','%console%','%videogame%','%caixa de som%']) THEN 'eletronicos'
  WHEN lower("title") LIKE ANY (ARRAY['%cozinha%','%panela%','%air fryer%','%cafeteira%','%liquidificador%','%aspirador%','%ventilador%','%geladeira%','%micro-ondas%','%microondas%','%cama%','%banho%','%decoração%','%decoracao%','%móveis%','%moveis%','%cadeira%','%armário%','%armario%','%furadeira%','%ferramenta%']) THEN 'casa'
  WHEN lower("title") LIKE ANY (ARRAY['%camiseta%','%camisa%','%blusa%','%calça%','%calca%','%vestido%','%tênis%','%tenis%','%sandália%','%sandalia%','%sapato%','%bolsa%','%mochila%','%relógio%','%relogio%','%cueca%','%lingerie%','%jaqueta%','%short%']) THEN 'moda'
  WHEN lower("title") LIKE ANY (ARRAY['%perfume%','%maquiagem%','%batom%','%shampoo%','%condicionador%','%cabelo%','%hidratante%','%skincare%','%barbeador%','%secador%','%cosmético%','%cosmetico%','%protetor solar%']) THEN 'beleza'
  WHEN lower("title") LIKE ANY (ARRAY['%bicicleta%','%academia%','%fitness%','%halter%','%bola%','%chuteira%','%camping%','%barraca%','%esportivo%','%musculação%','%musculacao%','%patins%']) THEN 'esportes'
  WHEN lower("title") LIKE ANY (ARRAY['%bebê%','%bebe%','%fralda%','%brinquedo%','%criança%','%crianca%','%infantil%','%lego%','%boneca%','%carrinho de bebê%','%carrinho de bebe%','%mamadeira%']) THEN 'infantil'
  WHEN lower("title") LIKE ANY (ARRAY['%cachorro%','%gato%','%pet%','%ração%','%racao%','%coleira%','%areia sanitária%','%areia sanitaria%','%arranhador%']) THEN 'pet'
  WHEN lower("title") LIKE ANY (ARRAY['%automotivo%','%carro%','%moto%','%pneu%','%capacete%','%óleo motor%','%oleo motor%','%veicular%','%motociclista%']) THEN 'automotivo'
  WHEN lower("title") LIKE ANY (ARRAY['%alimento%','%bebida%','%café%','%cafe%','%chocolate%','%leite%','%cerveja%','%vinho%','%biscoito%','%arroz%','%feijão%','%feijao%','%açúcar%','%acucar%']) THEN 'supermercado'
  WHEN lower("title") LIKE ANY (ARRAY['%livro%','%caderno%','%caneta%','%papelaria%','%agenda%','%lápis%','%lapis%','%mochila escolar%']) THEN 'livros'
  ELSE 'outros'
END
WHERE "category" IS NULL;
