export const obterPista = (pistas) => {
    return pistas[Math.floor(Math.random() * pistas.length)]
}

export const obterCorredor = (corredores) => {
    const listaCorredores = []

    corredores.forEach(() => {
        const random = Math.floor(Math.random() * corredores.length)

        if (!listaCorredores[random]) {
            corredores[random].aliado = obterAliadoInimigo(corredores, corredores[random])
            corredores[random].inimigo = obterAliadoInimigo(corredores, corredores[random])
            const corredor = corredores[random]
            listaCorredores.push(corredor)
        }
    })

    return listaCorredores
}

export const obterFormacaoCorrida = (pista, corredores) => {
    return {
        pista: pista,
        corredores: corredores,
        tamanho: pista.tamanho
    }
}

export const simuladorCorrida = (formacaoCorrida) => {
    const rodadas = []
    const primeiraRodada = []
    let fimDeCorrida = false

    formacaoCorrida.corredores.forEach(corredor => {
        primeiraRodada.push(criarRodadaCorrida(corredor, formacaoCorrida.tamanho))
    })

    rodadas.push(primeiraRodada)

    let index = 0

    while (!fimDeCorrida) {
        const rodada = rodadas[index]
        const lista = []
        const rodadaIndex = index + 1

        rodada.forEach(corredor => {
            if ((corredor.posicaoCorrida + corredor.avanco) > formacaoCorrida.tamanho) {
                fimDeCorrida = true
            } else {
                const corredorDefinicaoPosicao = definePosicao(corredor, formacaoCorrida.pista, corredor.posicaoCorrida, rodadaIndex)
                lista.push(corredorDefinicaoPosicao)
            }
        })

        lista.forEach(corredor => {
            calculaBuffAliadoInimigo(rodadas[index], corredor)
            calculaBuffDePosicao(rodadas[index], corredor, formacaoCorrida.pista)
            descricao(lista, formacaoCorrida.tamanho, rodadaIndex)
        })

        if (!fimDeCorrida) {
            rodadas.push(lista)
        }

        index++
    }

    rodadas.shift()

    const colocaoCorredores = obterColocaoCorrida(rodadas[rodadas.length - 1])

    if (colocaoCorredores[0].nome == 'Dick Vigarista') {
        rodadas[rodadas.length - 1].forEach(corredor => {
            if(corredor.nome == 'Dick Vigarista') {
                corredor.descricao = 'Parou para trapacear'
            }
        })
    }


    rodadas.forEach((rodada, index) => {
        console.log(`Rodada ${index + 1}`);
        rodada.forEach(corredor => {
            console.log(corredor.nome + ' ' + corredor.descricao);
        })
    })
}

export const criarRodadaCorrida = (corredor, tamanho) => {
    const obj = {}

    obj.nome = corredor.nome
    obj.id = corredor.id
    obj.velocidade = corredor.velocidade
    obj.drift = corredor.drift
    obj.aceleracao = corredor.aceleracao
    obj.vantagem = corredor.vantagem
    obj.rodada = 1
    obj.aliado = corredor.aliado
    obj.inimigo = corredor.inimigo
    obj.avanco = 0
    obj.posicaoCorrida = 0
    obj.descricao = `${obj.posicaoCorrida}/${tamanho}` +
        ` aceleracao(${obj.aceleracao})`

    return obj
}

const definePosicao = (obj, pista, posicaoCorrida, rodada) => {
    const buffPista = calcularBuffVantagemDebuffPista(obj, pista)
    const corredor = {...obj}

    corredor.avanco = (atributoEscolha(rodada, corredor)[0] + buffPista) < 0 ? 0 : atributoEscolha(rodada, corredor)[0] + buffPista
    corredor.buffPista = buffPista
    corredor.posicaoCorrida = posicaoCorrida == undefined ? corredor.avanco : posicaoCorrida += corredor.avanco
    corredor.rodada = rodada

    if (corredor.posicaoCorrida < 0) {
        corredor.posicaoCorrida = 0
    }

    return corredor
}

export const calcularBuffVantagemDebuffPista = (corredor, pista) => {
    if (corredor.vantagem == pista.tipo) {
        return 2
    }

    return pista.debuff
}

const descricao = (corredores, tamanho, rodada) => {
    corredores.forEach(corredor => {
        corredor.descricao = `${corredor.posicaoCorrida}/${tamanho}` +
            ` ${atributoEscolha(rodada, corredor)[1]}(${atributoEscolha(rodada, corredor)[0]})` +
            ` ${corredor.buffPista < 0 ? `-  debuff da pista(${corredor.buffPista}` : `+  buff vantagem da pista(${corredor.buffPista}`})` +
            `${corredor.buffDePosicao == undefined ? '' : ` + buff de posicao(${corredor.buffDePosicao})`}` +
            `${((corredor.buffAliado == 0) || corredor.buffAliado == undefined) ? '' : ` + buff aliado(${corredor.buffAliado})`}` +
            `${((corredor.buffInimigo == 0) || corredor.buffInimigo == undefined) ? '' : ` - buff inimigo(${corredor.buffInimigo})`}`
    })
}

const atributoEscolha = (rodada, obj) => {
    let atributoEscolha, strAtributoEscolha

    if (rodada % 4 == 0) {
        atributoEscolha = obj.drift
        strAtributoEscolha = 'drift'
    } else if ((rodada) > 3) {
        atributoEscolha = obj.velocidade
        strAtributoEscolha = 'velocidade'
    } else {
        atributoEscolha = obj.aceleracao
        strAtributoEscolha = 'aceleracao'
    }

    return [atributoEscolha, strAtributoEscolha]
}

export const calculaBuffDePosicao = (corredoresRodadaAnterios, corredor, pista) => {
    let buffDePosicao
    const posicoesBuffs = {}
    const corredoresRodadaAnteriosColocao = obterColocaoCorrida(corredoresRodadaAnterios)

    pista.posicoesBuffs.forEach(item => {
        posicoesBuffs[item] = item
    })

    corredoresRodadaAnteriosColocao.forEach(item => {
        if (item.nome == corredor.nome && posicoesBuffs[item.posicaoCorrida.toString()] == item.posicaoCorrida) {
            buffDePosicao = item.colocacaoCorrida
            corredor.posicaoCorrida += buffDePosicao
            corredor.buffDePosicao = buffDePosicao
        } else {
            corredor.buffDePosicao = buffDePosicao
        }
    })

    return buffDePosicao
}

export const calculaBuffAliadoInimigo = (corredoresRodadaAnterios, corredor) => {
    let buff = 0

    if (corredoresRodadaAnterios == undefined) {
        return buff
    }

    corredoresRodadaAnterios.forEach(aliadoInimigo => {
        if (aliadoInimigo.nome == corredor.aliado) {
            const corredorAnterior = corredoresRodadaAnterios.find(item => {
                if (corredor.nome == item.nome) {
                    return item
                }
            })
            buff = buffAliadoInimigo(aliadoInimigo, corredorAnterior)
            corredor.buffAliado = buff
            corredor.avanco += buff
            corredor.posicaoCorrida += buff
        }

        if (aliadoInimigo.nome == corredor.inimigo) {
            const corredorAnterior = corredoresRodadaAnterios.find(item => {
                if (corredor.nome == item.nome) {
                    return item
                }
            })
            buff = buffAliadoInimigo(aliadoInimigo, corredorAnterior)
            corredor.buffInimigo = buff
            corredor.avanco -= buff
            corredor.posicaoCorrida -= buff
        }
    })

    return buff
}

const buffAliadoInimigo = (aliadoInimigo, corredor) => {
    let maior, menor, buff = 0


    if (corredor.posicaoCorrida > aliadoInimigo.posicaoCorrida) {
        maior = corredor.posicaoCorrida
        menor = aliadoInimigo.posicaoCorrida
    } else {
        menor = corredor.posicaoCorrida
        maior = aliadoInimigo.posicaoCorrida
    }

    if ((maior - menor) <= 2) {
        buff = 1
    }

    return buff
}

const obterAliadoInimigo = (corredores, corredor, aliado) => {
    const random = Math.floor(Math.random() * corredores.length)
    let corredorAliadoInimigo = {}

    if (corredor != corredores[random]) {
        if (aliado) {
            if (aliado != corredores[random].nome) {
                corredorAliadoInimigo = corredores[random]
            }
        } else {
            corredorAliadoInimigo = corredores[random]
        }
    }

    return corredorAliadoInimigo.nome == undefined ? '' : corredorAliadoInimigo.nome
}

const obterColocaoCorrida = (corredores) => {
    const listaCorredores = [...corredores.map(corredor => {
        return {
            ...corredor
        }
    })]

    for (let index = 0; index < listaCorredores.length; index++) {
        for (let j = 0; j < listaCorredores.length; j++) {
            const elementoAtual = { ...listaCorredores[j] }
            const elementoPosterior = { ...listaCorredores[j + 1] }

            if ((elementoAtual.posicaoCorrida - elementoPosterior.posicaoCorrida) < 0) {
                listaCorredores[j + 1] = elementoAtual
                listaCorredores[j] = elementoPosterior
            }
        }
    }

    listaCorredores.forEach((corredor, index) => {
        corredor.colocacaoCorrida = index
    })

    return listaCorredores
}


