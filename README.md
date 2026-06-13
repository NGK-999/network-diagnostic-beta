# Radar de C-A-S-A-D-A-S

Aplicacao web em HTML, CSS e JavaScript Vanilla com tema Cyberpunk/Neon para simular uma interface de localizacao e varredura em mapa.

## O que o programa faz

Ao abrir a pagina, o sistema exibe:

- Tema dark com detalhes em rosa neon.
- Titulo principal: `RADAR DE C-A-S-A-D-A-S (BETA RESTRITO)`.
- Botao: `[ LOCALIZAR ALVOS NUM RAIO DE 5KM ]`.
- Terminal de interceptacao de dados.
- Mapa Leaflet em tema escuro.
- Mira/crosshair sobreposta ao mapa.

Quando o usuario inicia a varredura, a aplicacao:

1. Desabilita o botao para evitar execucoes duplicadas.
2. Limpa o terminal.
3. Exibe a sequencia de logs configurada em `scanMessages`.
4. Solicita permissao de geolocalizacao ao navegador.
5. Captura latitude, longitude e precisao aproximada do GPS.
6. Centraliza o mapa nas coordenadas capturadas.
7. Executa uma animacao `flyTo` ate o zoom tatico.
8. Renderiza pinos vermelhos estilizados na posicao e em pontos proximos.
9. Aguarda 3000ms apos o ultimo log e executa `iniciarSusto()`.

## Arquivos principais

### `index.html`

Define a estrutura da interface:

- Header do sistema.
- Painel de controle.
- Area do mapa.
- Camada visual de mira.
- Terminal de logs.
- Imports do Leaflet e do `script.js`.

### `styles.css`

Define o visual:

- Fundo `#050505`.
- Tipografia monoespacada.
- Detalhes neon via `--green: #ff007f`.
- Layout responsivo.
- Terminal escuro.
- Pinos vermelhos pulsantes.

### `script.js`

Controla a aplicacao:

- Inicializa o Leaflet.
- Solicita geolocalizacao com `navigator.geolocation`.
- Atualiza logs e status.
- Move o mapa com `map.flyTo`.
- Cria pinos customizados com `L.divIcon`.
- Executa `iniciarSusto()` ao final da varredura.

## Dependencias externas

Leaflet via CDN:

- `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
- `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

Tiles do mapa:

```text
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

O alerta sonoro usa o arquivo local `nuclear-alarm-siren.mp3`, carregado na raiz do projeto.

## Como executar localmente

Use um servidor local para permitir a geolocalizacao:

```sh
npx serve .
```

Depois acesse:

```text
http://127.0.0.1:3000/
```

Tambem e possivel usar qualquer outro servidor estatico apontando para a raiz do projeto.
