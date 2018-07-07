function DOMtoString(document_root) {
    
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }

    var problemasUsabilidade = "";
    if(!verificarHierarquiaHeader(html)){
        problemasUsabilidade += "A página não respeita a hierarquia dos headers\n";
    }
    if(!verificarHeader(html)){
        problemasUsabilidade += "A página não possui um header para identificar qual página está\n";
    }
    if(!verificarAltDeImagem(html)){
        problemasUsabilidade += "Existem imagens que não possuem um texto alternativo\n";
    }

    if(!verificarInputLabel(html)){
        problemasUsabilidade += "Existem inputs que não possuem label\n";
    }

    if(!verificarClickKey(html)){
        problemasUsabilidade += "Existem botões com eventos de click que não possuem eventos de keypress\n";
    }
    return problemasUsabilidade;
}

function verificarClickKey(html){
    var botoes = buscarTodasTags("button", html);

    for(var cont = 0; cont < botoes.length; botoes++){
        
        var onclick = buscarValorAtributosTag(botoes[cont], "onclick");
        if(onclick !== null){
            var onkeypress = buscarValorAtributosTag(botoes[cont], "onkeypress");
            
            if(onkeypress === null) return false;
        }
    }
    return true;
}

function verificarInputLabel(html){
    var inputs = buscarTodasTags("input", html);
    // Verifica se alguma input nao possui o atributo nome, se existir, ele nao possui uma label
    var inputNames = [];
    for(var cont=0; cont<inputs.length; cont++){
        var valor = buscarValorAtributosTag(inputs[cont], "name");
        inputNames.push(valor);
        if (valor == null) return false;
    }
    var labels = buscarTodasTags("label", html);
    var inputsComLabel = [];
    for(var cont=0; cont<labels.length; cont++){
        var valor = buscarValorAtributosTag(labels[cont], "for");
        if(valor !== null){
            for(var cont2 = 0; cont2 < inputNames.length; cont2++){
                if(valor === inputNames[cont2]){
                    inputNames.splice(cont2,1);
                    cont2 = inputNames.length;
                }
            }
        }
    }

    return inputNames.length === 0;
}

function buscarTag(tag, html){
    
    var indexInicio = html.indexOf("<"+ tag);
    if(indexInicio <= 0){
        return null;
    }
    var content = html.substr(indexInicio);
    var indexFinal = content.indexOf(">");
    
    
    return html.substr(indexInicio,indexFinal + tag.length);
}

function verificarAltDeImagem(html){
    var tags = buscarTodasTags("img", html);
    for(var cont = 0; cont < tags.length; cont++){
        var valorTag = buscarValorAtributosTag(tags[cont], "alt");
        if(valorTag === null || valorTag === ""){
            return false;
        }
    }
    return true;
}


function buscarIndiceTag(tag, html){
    return html.indexOf("<"+tag);
}

function buscarValorAtributosTag(tag, atributo){
    
    var possuiAtributo = tag.indexOf(atributo) > 0;
    if(!possuiAtributo){
        return null;
    }
    var parteValor = tag.split(atributo)[1];
    var parteValorSemInicio = parteValor.substr(2, parteValor.length);
    
    var indiceFinalString = parteValorSemInicio.indexOf('"');
    var valor = parteValorSemInicio.substr(0,indiceFinalString);

    return valor;
}

function buscarTodasTags(tag, html){
    var tags = [];
    var trechos = html.split("<"+tag);
    for(var cont = 1; cont < trechos.length; cont++){
        
        var sub = trechos[cont];
        var trechoFinal = sub.split(">")[0]; 
        var tagFinal = "<"+tag+trechoFinal+ ">";
        tags.push(tagFinal);
    }
    return tags;
}

function buscarIndicesTodasTags(tag, html){
    // Busca todos os inicios de html depois da tag encontrada
    var trechos = html.split("<"+tag);
    
    // Encontra o indice de cada tag
    var indices = [];
    for(var cont = 1;cont<trechos.length; cont++){
        indices.push(html.indexOf(trechos[cont]) - (tag.length+1));
    }
    return indices;
}


function verificarHierarquiaHeader(html){
    var indicesh1 = buscarIndicesTodasTags("h1", html);
    var indicesh2 = buscarIndicesTodasTags("h2", html);
    var indicesh3 = buscarIndicesTodasTags("h3", html);
    var indicesh4 = buscarIndicesTodasTags("h4", html);
    var indicesh5 = buscarIndicesTodasTags("h5", html);
    var indicesh6 = buscarIndicesTodasTags("h6", html);
    
    // h1 - h2
    if(compararVetor(indicesh1, indicesh2))  return true;
    // h2 - h3
    if(compararVetor(indicesh2, indicesh3))  return true;
    // h1 - h3
    if(compararVetor(indicesh1, indicesh3))  return true;
    // h1 - h4
    if(compararVetor(indicesh1, indicesh4))  return true;
    // h2 - h4
    if(compararVetor(indicesh2, indicesh4))  return true;
    // h3 - h4
    if(compararVetor(indicesh3, indicesh4))  return true;
    // h1 - h5
    if(compararVetor(indicesh1, indicesh5))  return true;
    // h2 - h5
    if(compararVetor(indicesh2, indicesh5))  return true;
    // h3 - h5
    if(compararVetor(indicesh3, indicesh5))  return true;
    // h4 - h5
    if(compararVetor(indicesh4, indicesh5))  return true;
    // h1 - h6
    if(compararVetor(indicesh1, indicesh6))  return true;
    // h2 - h6
    if(compararVetor(indicesh2, indicesh6))  return true;
    // h3 - h6
    if(compararVetor(indicesh3, indicesh6))  return true;
    // h4 - h6
    if(compararVetor(indicesh4, indicesh6))  return true;
    // h5 - h6
    if(compararVetor(indicesh5, indicesh6))  return true;
    
    return false;
}


function compararVetor(indicesh1, indicesh2) {
    for(var h1 = 0; h1 < indicesh1.length; h1++){
        for(var h2 = 0; h2< indicesh2.length; h2++){
            if(indicesh2[h2] < indicesh1[h1]){
                return true;
            }
        }
    }
}

function verificarHeader(html){
    var h1 =  buscarTag("h1", html);
    var h2 =  buscarTag("h2", html);
    var h3 =  buscarTag("h3", html);
    var h4 =  buscarTag("h4", html);
    var h5 =  buscarTag("h5", html);
    var h6 =  buscarTag("h6", html);

    return h1 !== null || h2 !== null || h3 !== null || h4 !== null || h5 !== null || h6 !== null;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});