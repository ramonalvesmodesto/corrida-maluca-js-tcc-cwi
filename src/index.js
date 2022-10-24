export const obterPista = (pistas, nomePista) => {
    return pistas.find(pista => {
        return pista.nome == nomePista
    })
}

export const obterCorredor = (corredores, nomeCorredor) => {
    return corredores.find(corredor => {
        return corredor.nome == nomeCorredor
    })
}

export const simuladorCorrida = (corredores, pista) => {
    let fimDeCorrida = false
    const rodadasCorrida = []

    for (let index = 0; !fimDeCorrida; index++) {
        const corredoresRodadaAnterior = rodadasCorrida[index - 1]
        const corredoresProximaRodada = criarRodadaCorrida(corredores, corredoresRodadaAnterior, pista, index)
        fimDeCorrida = definicaoCorrida(corredoresProximaRodada, pista.tamanho)

        if (!fimDeCorrida) {
            rodadasCorrida.push(corredoresProximaRodada)
        }
    }

    const colocaoCorredores = obterColocaoCorrida(rodadasCorrida[rodadasCorrida.length - 1], true)
    rodadasCorrida.pop()
    rodadasCorrida.push(colocaoCorredores)
    exibirCorrida(rodadasCorrida)

    return colocaoCorredores[0].nome
}

export const criarRodadaCorrida = (corredores, corredoresRodadaAnterior, pista, index) => {
    const rodadaIndex = index + 1
    if (!corredoresRodadaAnterior) {
        const primeiraRodadaCorrida = criarCorredoresCorrida(corredores)
        return definePosicaoCorredores(primeiraRodadaCorrida, pista, rodadaIndex)
    }
    
    const corredoresProximaRodada = definePosicaoCorredores(corredoresRodadaAnterior, pista, rodadaIndex)
    return corredoresProximaRodada
}

export const exibirCorrida = (rodadas) => {
    rodadas.forEach((rodada, index) => {
        console.log(`Rodada ${index + 1}`);
        rodada.forEach(corredor => {
            console.log(corredor.nome + ' ' + corredor.descricao);
        })
    })
}

export const definicaoCorrida = (corredores, tamanhoCorrida) => {
    let statusCorrida = false
    corredores.forEach(corredor => {
        if ((corredor.posicaoCorrida + corredor.avancarPosicao) > tamanhoCorrida) {
            statusCorrida = true
        }
    })
    return statusCorrida
}

export const definePosicaoCorredores = (corredoresRodadaAnterior, pista, rodadaIndex) => {
    const listaCorredoresComtodosAtributos = []
    corredoresRodadaAnterior.forEach(corredorRodadaAnterior => {
        const buffDePosicao = calculaBuffDePosicao(corredoresRodadaAnterior, corredorRodadaAnterior, pista.posicoesBuffs)
        const buffAliado = calculaBuffAliadoInimigo(corredoresRodadaAnterior, corredorRodadaAnterior, corredorRodadaAnterior.aliado) == 1 ? 1 : 0
        const buffInimigo = calculaBuffAliadoInimigo(corredoresRodadaAnterior, corredorRodadaAnterior, corredorRodadaAnterior.inimigo) == 1 ? -1 : 0
        const buffPista = calcularBuffVantagemDebuffPista(corredoresRodadaAnterior, pista)
        const calculoAvancoBuffPista = atributoEscolha(rodadaIndex, corredorRodadaAnterior)[0] + buffPista
        const calculoAvancoBuffAliadoDebuffInimigo = buffAliado + buffInimigo + buffDePosicao
        const somaBuffsDebuffs = calculoAvancoBuffPista + calculoAvancoBuffAliadoDebuffInimigo
        const corredorProximaRodada = {
            ...corredorRodadaAnterior,
            buffPista: buffPista,
            buffAliado: buffAliado,
            buffInimigo: buffInimigo,
            buffDePosicao: buffDePosicao,
            avancarPosicao: (somaBuffsDebuffs) < 0 ? 0 : somaBuffsDebuffs,
            rodada: rodadaIndex
        }
        corredorProximaRodada.posicaoCorrida = corredorProximaRodada.posicaoCorrida + corredorProximaRodada.avancarPosicao
        const desc = descricao(corredorProximaRodada, pista.tamanho, rodadaIndex)
        corredorProximaRodada.descricao = desc
        listaCorredoresComtodosAtributos.push(corredorProximaRodada)
    })
    return listaCorredoresComtodosAtributos
}

export const criarCorredoresCorrida = (corredores) => {
    const novosCorredores = corredores.map(corredor => {
        return criarCorredor(corredor)
    })
    return novosCorredores
}

export const criarCorredor = (personagem, aliado, inimigo) => {
    const corredor = {}

    corredor.nome = personagem.nome
    corredor.id = personagem.id
    corredor.velocidade = personagem.velocidade
    corredor.drift = personagem.drift
    corredor.aceleracao = personagem.aceleracao
    corredor.vantagem = personagem.vantagem
    corredor.rodada = 1
    corredor.aliado = (aliado == undefined) ? personagem.aliado : aliado
    corredor.inimigo = (inimigo == undefined) ? personagem.inimigo : inimigo
    corredor.avancarPosicao = 0
    corredor.posicaoCorrida = 0

    return corredor
}

export const descricao = (corredor, tamanho, rodada) => {
    const desc = `${corredor.posicaoCorrida}/${tamanho} ` +
        `${atributoEscolha(rodada, corredor)[1]}(${atributoEscolha(rodada, corredor)[0]}) ` +
        `${corredor.buffPista < 0 ? `-  debuff da pista(${corredor.buffPista}` : `+  buff vantagem da pista(${corredor.buffPista}`})` +
        `${corredor.buffDePosicao == 0 ? '' : ` + buff de posicao(${corredor.buffDePosicao})`}` +
        `${((corredor.buffAliado == 0) || corredor.buffAliado == undefined) ? '' : ` + buff aliado(${corredor.buffAliado})`}` +
        `${((corredor.buffInimigo == 0) || corredor.buffInimigo == undefined) ? '' : ` - buff inimigo(${corredor.buffInimigo})`}`

    return desc
}

export const atributoEscolha = (rodada, corredor) => {
    let escolha, strEscolha

    if (rodada % 4 == 0) {
        escolha = corredor.drift
        strEscolha = 'drift'
    } else if ((rodada) > 3) {
        escolha = corredor.velocidade
        strEscolha = 'velocidade'
    } else {
        escolha = corredor.aceleracao
        strEscolha = 'aceleracao'
    }

    return [escolha, strEscolha]
}

export const calculaBuffDePosicao = (corredoresRodadaAnterior, corredorRodadaAnterior, posicoesBuffs) => {
    const corredores = obterColocaoCorrida(corredoresRodadaAnterior, false)
    const corredorEncontrado = obterCorredor(corredores, corredorRodadaAnterior.nome)
    let buffDePosicao = 0

    posicoesBuffs.forEach(posicao => {
        if (posicao == corredorEncontrado.posicaoCorrida) {
            buffDePosicao = corredorEncontrado.colocacaoCorrida
        }
    })

    return buffDePosicao
}

export const calcularBuffVantagemDebuffPista = (corredor, pista) => {
    if (corredor.vantagem == pista.tipo) {
        return 2
    }

    return pista.debuff
}

export const calculaBuffAliadoInimigo = (corredoresRodadaAnterior, corredorRodadaAnterior, nomeAliadoInimigo) => {
    let buffAliadoInimigo = 0
    const aliadoInimigo = obterCorredor(corredoresRodadaAnterior, nomeAliadoInimigo)

    if (aliadoInimigo) {
        buffAliadoInimigo = validaBuffAliadoInimigo(aliadoInimigo, corredorRodadaAnterior) ? 1 : 0
    }

    return buffAliadoInimigo
}

export const validaBuffAliadoInimigo = (aliadoInimigo, corredor) => {
    let maior, menor, bool = false

    if (corredor.posicaoCorrida > aliadoInimigo.posicaoCorrida) {
        maior = corredor.posicaoCorrida
        menor = aliadoInimigo.posicaoCorrida
    } else {
        menor = corredor.posicaoCorrida
        maior = aliadoInimigo.posicaoCorrida
    }

    if ((maior - menor) <= 2) {
        bool = true
    }

    return bool
}

export const obterColocaoCorrida = (corredores, boolUltimaRodada) => {
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

    if (boolUltimaRodada) {
        if (listaCorredores[0].nome == 'Dick Vigarista') {
            const dickVigarista = { ...listaCorredores[0] }
            dickVigarista.descricao = 'Parou para trapacear'
            listaCorredores.shift()
            listaCorredores.push(dickVigarista)
        }
    }

    return listaCorredores
}
