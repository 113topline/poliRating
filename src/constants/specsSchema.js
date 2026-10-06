// Definition of specifications according to requirements.md

export const COMMON_CONNECTIVITY_CHILDREN = [
  { key: 'cabeado', label: 'Com fio', type: 'boolean' },
  { key: 'dongle24', label: 'Sem fio', type: 'boolean' },
  { key: 'bluetooth', label: 'Bluetooth', type: 'boolean' },
]

export const SPECS_SCHEMA = {
  mouse: [
    { key: 'sensor', label: 'Sensor', type: 'text' },
    { key: 'mcu', label: 'MCU', type: 'text' },
    { key: 'maxDpi', label: 'DPI máximo', type: 'text' },
    { key: 'maxPollingRate', label: 'Polling rate máximo', type: 'text', unit: 'Hz' },
    { key: 'lod', label: 'LOD', type: 'text' },
    { key: 'buttonCount', label: 'Quantidade de botões', type: 'text' },
    { key: 'switchModel', label: 'Modelo de switch', type: 'text' },
    { key: 'encoder', label: 'Encoder', type: 'text' },
    { key: 'batterySize', label: 'Tamanho da bateria', type: 'text', unit: 'mAh' },
    { key: 'weight', label: 'Peso', type: 'text', unit: 'g' },
    { key: 'feetType', label: 'Tipo de feet', type: 'text' },
    { key: 'construction', label: 'Construção', type: 'text' },
    { key: 'coating', label: 'Coating', type: 'text' },
    {
      key: 'connectivity',
      label: 'Conectividade',
      type: 'group',
      children: COMMON_CONNECTIVITY_CHILDREN,
    },
    { key: 'otherSpecs', label: 'Outros', type: 'text' },
  ],

  keyboard: [
    {
      key: 'switchType',
      label: 'Tipo de switch',
      type: 'select',
      options: ['Magnético', 'Mecânico', 'Óptico', 'Membrana'],
    },
    { key: 'switchModel', label: 'Modelo de switch', type: 'text' },
    { key: 'layout', label: 'Layout (quantidade de teclas)', type: 'text' },
    { key: 'hotswappable', label: 'Hotswappable', type: 'boolean' },
    { key: 'knob', label: 'Knob', type: 'boolean' },
    { key: 'rgb', label: 'RGB', type: 'boolean' },
    { key: 'screen', label: 'Tela', type: 'boolean' },
    { key: 'keycaps', label: 'Keycaps', type: 'text' },
    { key: 'factoryMods', label: 'Mods de fábrica', type: 'text' },
    { key: 'construction', label: 'Construção', type: 'text' },
    { key: 'weight', label: 'Peso', type: 'text', unit: 'g' },
    { key: 'batterySize', label: 'Tamanho da bateria', type: 'text', unit: 'mAh' },
    {
      key: 'connectivity',
      label: 'Conectividade',
      type: 'group',
      children: COMMON_CONNECTIVITY_CHILDREN,
    },
    { key: 'otherSpecs', label: 'Outros', type: 'text' },
  ],

  gamepad: [
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: ['Simétrico', 'Assimétrico'],
    },
    {
      key: 'stickType',
      label: 'Tipo de stick',
      type: 'select',
      options: ['Analógico', 'Hall Effect', 'TMR'],
    },
    {
      key: 'triggerType',
      label: 'Tipo de gatilho',
      type: 'select',
      options: ['Analógico', 'Hall Effect', 'TMR'],
    },
    {
      key: 'faceButtonType',
      label: 'Tipo de face buttons',
      type: 'select',
      options: ['Membrana', 'Analógico', 'Mecânico', 'Micro-switch', 'Óptico'],
    },
    {
      key: 'dpadType',
      label: 'Tipo de dpad',
      type: 'select',
      options: ['Membrana', 'Analógico', 'Mecânico', 'Micro-switch', 'Óptico'],
    },
    { key: 'triggerLocks', label: 'Travas de gatilho', type: 'boolean' },
    {
      key: 'shortTriggerType',
      label: 'Tipo de gatilho curto',
      type: 'select',
      options: ['Micro-switch', 'Óptico', 'Hall Effect', 'TMR'],
    },
    { key: 'maxPollingRate', label: 'Polling rate máximo', type: 'text', unit: 'Hz' },
    { key: 'analogResolution', label: 'Resolução dos analógicos', type: 'text' },
    { key: 'triggerResolution', label: 'Resolução dos gatilhos', type: 'text' },
    { key: 'batterySize', label: 'Tamanho da bateria', type: 'text', unit: 'mAh' },
    { key: 'weight', label: 'Peso', type: 'text', unit: 'g' },
    { key: 'construction', label: 'Construção', type: 'text' },
    {
      key: 'connectivity',
      label: 'Conectividade',
      type: 'group',
      children: COMMON_CONNECTIVITY_CHILDREN,
    },
    {
      key: 'platforms',
      label: 'Plataformas',
      type: 'group',
      children: [
        { key: 'pc', label: 'PC', type: 'boolean' },
        { key: 'playstation', label: 'PlayStation', type: 'boolean' },
        { key: 'xbox', label: 'Xbox', type: 'boolean' },
        { key: 'nintendoSwitch', label: 'Nintendo Switch', type: 'boolean' },
        { key: 'iosAndroid', label: 'iOS/Android', type: 'boolean' },
      ],
    },
    { key: 'otherSpecs', label: 'Outros', type: 'text' },
  ],

  headset: [
    {
      key: 'headsetType',
      label: 'Tipo de headset',
      type: 'select',
      options: ['Over-ear', 'On-ear', 'In-ear'],
    },
    { key: 'driverCount', label: 'Quantidade de drivers', type: 'text' },
    { key: 'driverType', label: 'Tipo de driver', type: 'text' },
    { key: 'driverSize', label: 'Tamanho do driver', type: 'text' },
    { key: 'frequencyResponse', label: 'Resposta de frequência', type: 'text' },
    {
      key: 'microphone',
      label: 'Microfone',
      type: 'boolean_group', // Checkmark on the group itself that enables/disables child fields
      children: [
        { key: 'micType', label: 'Tipo de microfone', type: 'text' },
        { key: 'removable', label: 'Removível', type: 'boolean' },
      ],
    },
    { key: 'buttonCount', label: 'Quantidade de botões', type: 'text' },
    { key: 'batterySize', label: 'Tamanho da bateria', type: 'text', unit: 'mAh' },
    { key: 'weight', label: 'Peso', type: 'text', unit: 'g' },
    {
      key: 'connectivity',
      label: 'Conectividade',
      type: 'group',
      children: COMMON_CONNECTIVITY_CHILDREN,
    },
    { key: 'construction', label: 'Construção', type: 'text' },
    { key: 'earpads', label: 'Earpads', type: 'text' },
    { key: 'otherSpecs', label: 'Outros', type: 'text' },
  ],
}
