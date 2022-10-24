import axios from 'axios'
import {
  obterPista,
  obterCorredor,
  calcularBuffVantagemDebuffPista,
  simuladorCorrida,
  calculaBuffDePosicao,
  calculaBuffAliadoInimigo,
  criarCorredor,
  definePosicaoCorredores
} from '../src/index'

let pistas, corredores

beforeAll(async () => {
  pistas = await axios.get('https://gustavobuttenbender.github.io/gus.github/corrida-maluca/pistas.json')
  corredores = await axios.get('https://gustavobuttenbender.github.io/gus.github/corrida-maluca/personagens.json')

  pistas = pistas.data
  corredores = corredores.data
})

describe('Exemplo de testes', () => {
  it('true deve ser true', () => {
    expect(true).toBeTruthy()
  })
})

describe('Formação da corrida', () => {
  it('Deve conseguir obter a pista corretamente', () => {
    const pista = obterPista(pistas, 'Deserto do Saara')
    const pistaNomeEsperado = 'Deserto do Saara'

    expect(pista.nome).toBe(pistaNomeEsperado)
  })

  it('Deve conseguir obter o corredor corretamente', () => {
    const corredor = obterCorredor(corredores, 'Professor Aéreo')
    const corredorEsperado = 'Professor Aéreo'

    expect(corredor.nome).toBe(corredorEsperado)
  })
})

describe('Calculos', () => {
  it('Deve conseguir calcular a vantagem de tipo pista corretamente', () => {
    const corredor = obterCorredor(corredores, 'Irmãos Rocha')
    const pista = obterPista(pistas, 'Himalaia')

    const calculoBuffCorredor = calcularBuffVantagemDebuffPista(corredor, pista)
    const buffCorredorEsperado = 2

    expect(calculoBuffCorredor).toBe(buffCorredorEsperado)

  })

  it('Deve conseguir calcular o debuff de pista corretamente', () => {
    const corredor = obterCorredor(corredores, 'Irmãos Rocha')
    const pista = obterPista(pistas, 'F1')

    const calculoBuffCorredor = calcularBuffVantagemDebuffPista(corredor, pista)
    const buffCorredorEsperado = -1

    expect(calculoBuffCorredor).toBe(buffCorredorEsperado)

  })

  it('Deve conseguir calcular o buff de posição de pista para 3 corredores', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'))
    const baraoVermelho = criarCorredor(obterCorredor(corredores, 'Barão Vermelho'))
    const penepoleCharmosa = criarCorredor(obterCorredor(corredores, 'Penélope Charmosa'))

    const pista = obterPista(pistas, 'Himalaia')
    const corredoresCorrida = definePosicaoCorredores([irmaosRocha, baraoVermelho, penepoleCharmosa], pista, 1)

    const buffPosicao = calculaBuffDePosicao(corredoresCorrida, baraoVermelho, [0, 1, 2, 3, 4, 5])
    const buffPistaEsperado = 2

    expect(buffPosicao).toBe(buffPistaEsperado)
  })

  it('Deve conseguir calcular a próxima posição corretamente se estiver sob o buff de um aliado', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'), 'Barão Vermelho')
    const baraoVermelho = criarCorredor(obterCorredor(corredores, 'Barão Vermelho'))

    const pista = obterPista(pistas, 'Himalaia')
    const corredoresCorrida = definePosicaoCorredores([irmaosRocha, baraoVermelho], pista, 1)

    const buffAliado = calculaBuffAliadoInimigo(corredoresCorrida, irmaosRocha, irmaosRocha.aliado)
    const buffAliadoEsperado = 1

    expect(buffAliado).toBe(buffAliadoEsperado)
  })

  it('Deve conseguir calcular a próxima posição corretamente se estiver sob o debuff de um inimigo', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'), undefined, 'Barão Vermelho')
    const baraoVermelho = criarCorredor(obterCorredor(corredores, 'Barão Vermelho'))

    const pista = obterPista(pistas, 'Himalaia')
    const corredoresCorrida = definePosicaoCorredores([irmaosRocha, baraoVermelho], pista, 1)

    const buffInimigo = calculaBuffAliadoInimigo(corredoresCorrida, irmaosRocha, irmaosRocha.inimigo)
    const buffInimigoEsperado = 1

    expect(buffInimigo).toBe(buffInimigoEsperado)
  })

  it('Deve conseguir calcular as novas posições corretamente de uma rodada para a próxima', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'))
    const baraoVermelho = criarCorredor(obterCorredor(corredores, 'Barão Vermelho'))

    const pista = obterPista(pistas, 'Himalaia')
    const corredoresCorrida = definePosicaoCorredores([irmaosRocha, baraoVermelho], pista, 1)

    const posicoes = [corredoresCorrida[0].posicaoCorrida, corredoresCorrida[1].posicaoCorrida]
    const posicoesEperadas = [1, 0]

    expect(posicoes).toEqual(posicoesEperadas)
  })
})

describe('Vencedor', () => {
  it('Deve conseguir completar uma corrida com um vencedor', () => {
    const irmaosRocha = obterCorredor(corredores, 'Irmãos Rocha')
    const irmaosPavor = obterCorredor(corredores, 'Irmãos Pavor')
    const professorAereo = obterCorredor(corredores, 'Professor Aéreo')
    const pista = obterPista(pistas, 'Himalaia')
    const listaCorredores = [irmaosRocha, irmaosPavor, professorAereo]

    const vencedor = simuladorCorrida(listaCorredores, pista)
    const vencedorEsperado = 'Professor Aéreo'

    expect(vencedor).toBe(vencedorEsperado)
  })
})

describe('Criação', () => {
  it('Deve conseguir criar corredor corretamente somente com aliado', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'), 'Barão Vermelho')

    const aliado = irmaosRocha.aliado
    const inimigo = irmaosRocha.inimigo

    const bool = (aliado == 'Barão Vermelho') && (inimigo == undefined)

    expect(bool).toBeTruthy()
  })

  it('Deve conseguir criar corredor corretamente somente com inimigo', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'), undefined, 'Barão Vermelho')

    const aliado = irmaosRocha.aliado
    const inimigo = irmaosRocha.inimigo

    const bool = (aliado == undefined) && (inimigo == 'Barão Vermelho')

    expect(bool).toBeTruthy()
  })

  it('Deve conseguir criar corredor corretamente com aliado e inimigo', () => {
    const irmaosRocha = criarCorredor(obterCorredor(corredores, 'Irmãos Rocha'), 'Penélope Charmosa', 'Barão Vermelho')

    const aliado = irmaosRocha.aliado
    const inimigo = irmaosRocha.inimigo

    const bool = (aliado == 'Penélope Charmosa') && (inimigo == 'Barão Vermelho')

    expect(bool).toBeTruthy()
  })
})

describe('Impedir', () => {
  it('Deve impedir que corredor se mova negativamente mesmo se o calculo de velocidade seja negativo', () => {
    const sargentoBombarda = criarCorredor(obterCorredor(corredores, 'Sargento Bombarda'))
    const pista = obterPista(pistas, 'Deserto do Saara')

    const corredor = definePosicaoCorredores([sargentoBombarda], pista)
    const posicaoEsperado = 0

    expect(corredor[0].posicaoCorrida).toBe(posicaoEsperado)
  })

  it('Deve impedir que o Dick Vigarista vença a corrida se estiver a uma rodada de ganhar', () => {
    const dickVigarista = criarCorredor(obterCorredor(corredores, 'Dick Vigarista'), 'Penélope Charmosa', 'Peter Perfeito')
    const penepoleCharmosa = criarCorredor(obterCorredor(corredores, 'Penélope Charmosa'), 'Irmãos Rocha', 'Professor Aéreo')
    const peterPerfeito = criarCorredor(obterCorredor(corredores, 'Peter Perfeito'), 'Barão Vermelho', 'Sargento Bombarda')
    const pista = obterPista(pistas, 'Himalaia')
    const listaCorredores = [dickVigarista, penepoleCharmosa, peterPerfeito]

    pista.debuff = -1

    const vencedor = simuladorCorrida(listaCorredores, pista)
    const vencedorEsperado = 'Penélope Charmosa'

    expect(vencedor).toBe(vencedorEsperado)
  })
})


