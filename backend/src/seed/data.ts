import type { Species } from '../domain/Species'
import type { Observation } from '../domain/Observation'

export const speciesSeed: Species[] = [
  {
    id: 's1',
    name: 'Arara-azul-grande',
    scientificName: 'Anodorhynchus hyacinthinus',
    category: 'Bird',
    status: 'Vulnerable',
    description: 'A maior arara do mundo, endêmica do Pantanal e cerrado brasileiro. Alimenta-se principalmente de cocos de babaçu e acuri.',
    biome: 'Pantanal',
    observationCount: 0,
    createdAt: '2022-01-10T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Onça-pintada',
    scientificName: 'Panthera onca',
    category: 'Mammal',
    status: 'Near Threatened',
    description: 'Maior felino das Américas, ocorre em todos os biomas brasileiros. Predador de topo essencial para o equilíbrio ecológico.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-01-15T00:00:00Z',
  },
  {
    id: 's3',
    name: 'Boto-cor-de-rosa',
    scientificName: 'Inia geoffrensis',
    category: 'Mammal',
    status: 'Endangered',
    description: 'Golfinho de água doce endêmico da bacia Amazônica. Espécie símbolo da região amazônica, ameaçada pela pesca e poluição.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-02-01T00:00:00Z',
  },
  {
    id: 's4',
    name: 'Peixe-boi da Amazônia',
    scientificName: 'Trichechus inunguis',
    category: 'Mammal',
    status: 'Vulnerable',
    description: 'Único sirenio exclusivamente de água doce do mundo. Habita rios e lagos da Amazônia, alimentando-se de vegetação aquática.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-02-10T00:00:00Z',
  },
  {
    id: 's5',
    name: 'Mico-leão-dourado',
    scientificName: 'Leontopithecus rosalia',
    category: 'Mammal',
    status: 'Endangered',
    description: 'Primata endêmico da Mata Atlântica do Rio de Janeiro. Um dos símbolos da conservação bem-sucedida no Brasil.',
    biome: 'Mata Atlântica',
    observationCount: 0,
    createdAt: '2022-03-01T00:00:00Z',
  },
  {
    id: 's6',
    name: 'Tamanduá-bandeira',
    scientificName: 'Myrmecophaga tridactyla',
    category: 'Mammal',
    status: 'Vulnerable',
    description: 'Maior tamanduá do mundo, ocorre principalmente no Cerrado e Pantanal. Pode consumir até 35.000 formigas por dia.',
    biome: 'Cerrado',
    observationCount: 0,
    createdAt: '2022-03-15T00:00:00Z',
  },
  {
    id: 's7',
    name: 'Lobo-guará',
    scientificName: 'Chrysocyon brachyurus',
    category: 'Mammal',
    status: 'Near Threatened',
    description: 'Maior canídeo da América do Sul, símbolo do Cerrado. Possui pernas longas adaptadas para visualizar presas na vegetação alta.',
    biome: 'Cerrado',
    observationCount: 0,
    createdAt: '2022-04-01T00:00:00Z',
  },
  {
    id: 's8',
    name: 'Pato-mergulhão',
    scientificName: 'Mergus octosetaceus',
    category: 'Bird',
    status: 'Critically Endangered',
    description: 'Uma das aves mais ameaçadas do Brasil, habita rios de correnteza em matas de galeria do Cerrado e Mata Atlântica.',
    biome: 'Cerrado',
    observationCount: 0,
    createdAt: '2022-04-15T00:00:00Z',
  },
  {
    id: 's9',
    name: 'Gavião-real',
    scientificName: 'Harpia harpyja',
    category: 'Bird',
    status: 'Vulnerable',
    description: 'Maior águia das Américas, habita florestas tropicais densas. Predador ápice que se alimenta de macacos e preguiças.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-05-01T00:00:00Z',
  },
  {
    id: 's10',
    name: 'Capivara',
    scientificName: 'Hydrochoerus hydrochaeris',
    category: 'Mammal',
    status: 'Least Concern',
    description: "Maior roedor do mundo, presente em todos os biomas brasileiros próximos a corpos d'água. Espécie altamente adaptável.",
    biome: 'Pantanal',
    observationCount: 0,
    createdAt: '2022-05-10T00:00:00Z',
  },
  {
    id: 's11',
    name: 'Tatu-canastra',
    scientificName: 'Priodontes maximus',
    category: 'Mammal',
    status: 'Vulnerable',
    description: 'Maior tatu do mundo, espécie engenheiro que cria tocas usadas por dezenas de outras espécies. Habita o Cerrado e Amazônia.',
    biome: 'Cerrado',
    observationCount: 0,
    createdAt: '2022-06-01T00:00:00Z',
  },
  {
    id: 's12',
    name: 'Jacaré-do-Pantanal',
    scientificName: 'Caiman yacare',
    category: 'Reptile',
    status: 'Least Concern',
    description: 'Crocodiliano mais abundante do Brasil, com população estimada em mais de 10 milhões de indivíduos no Pantanal.',
    biome: 'Pantanal',
    observationCount: 0,
    createdAt: '2022-06-15T00:00:00Z',
  },
  {
    id: 's13',
    name: 'Tartaruga-da-Amazônia',
    scientificName: 'Podocnemis expansa',
    category: 'Reptile',
    status: 'Vulnerable',
    description: 'Maior tartaruga de água doce das Américas. Realiza longas migrações pelos rios amazônicos para desovar em praias de areia.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-07-01T00:00:00Z',
  },
  {
    id: 's14',
    name: 'Pirarucu',
    scientificName: 'Arapaima gigas',
    category: 'Fish',
    status: 'Near Threatened',
    description: 'Um dos maiores peixes de água doce do mundo, podendo ultrapassar 3 metros. Espécie emblemática da pesca amazônica.',
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-07-15T00:00:00Z',
  },
  {
    id: 's15',
    name: 'Piranha-vermelha',
    scientificName: 'Pygocentrus nattereri',
    category: 'Fish',
    status: 'Least Concern',
    description: "Peixe de água doce amplamente distribuído na bacia Amazônica e no Pantanal. Importante predador e limpador de corpos d'água.",
    biome: 'Amazônia',
    observationCount: 0,
    createdAt: '2022-08-01T00:00:00Z',
  },
]

function rnd(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(5))
}

function rndDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(endYear, 11, 31).getTime()
  return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0] ?? ''
}

const biomeRegions: Record<string, { lat: [number, number]; lng: [number, number]; name: string }[]> = {
  Amazônia: [
    { lat: [-3, 2], lng: [-70, -52], name: 'Amazônia Ocidental' },
    { lat: [-5, -1], lng: [-55, -48], name: 'Amazônia Oriental' },
  ],
  Cerrado: [
    { lat: [-17, -10], lng: [-55, -45], name: 'Cerrado Central' },
    { lat: [-20, -14], lng: [-50, -43], name: 'Cerrado Sudeste' },
  ],
  Pantanal: [
    { lat: [-21, -17], lng: [-58, -54], name: 'Pantanal' },
  ],
  'Mata Atlântica': [
    { lat: [-24, -20], lng: [-47, -40], name: 'Mata Atlântica Sul' },
    { lat: [-16, -10], lng: [-41, -36], name: 'Mata Atlântica Norte' },
  ],
  Caatinga: [
    { lat: [-12, -7], lng: [-42, -36], name: 'Caatinga' },
  ],
}

const speciesBiomeMap: Record<string, string> = {
  s1: 'Pantanal',
  s2: 'Amazônia',
  s3: 'Amazônia',
  s4: 'Amazônia',
  s5: 'Mata Atlântica',
  s6: 'Cerrado',
  s7: 'Cerrado',
  s8: 'Cerrado',
  s9: 'Amazônia',
  s10: 'Pantanal',
  s11: 'Cerrado',
  s12: 'Pantanal',
  s13: 'Amazônia',
  s14: 'Amazônia',
  s15: 'Amazônia',
}

const notesPool = [
  'Avistamento registrado por câmera trap',
  'Observação em campo durante expedição científica',
  'Registrado por pesquisador local',
  'Avistamento confirmado por foto',
  'Monitoramento por telemetria',
  'Registro em levantamento de fauna',
  'Observação casual por morador local',
  'Detectado por armadilha fotográfica',
  'Avistamento em área de preservação',
  'Registro em transecto de monitoramento',
]

export const observationsSeed: Observation[] = []

let obsId = 1
for (const sp of speciesSeed) {
  const biome = speciesBiomeMap[sp.id] ?? 'Cerrado'
  const regions = biomeRegions[biome] ?? biomeRegions['Cerrado']!
  const count = sp.status === 'Least Concern' ? 12 : sp.status === 'Near Threatened' ? 9 : sp.status === 'Vulnerable' ? 7 : sp.status === 'Endangered' ? 5 : 3

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)]!
    observationsSeed.push({
      id: `o${obsId++}`,
      speciesId: sp.id,
      speciesName: sp.name,
      lat: rnd(region.lat[0], region.lat[1]),
      lng: rnd(region.lng[0], region.lng[1]),
      date: rndDate(2022, 2024),
      region: region.name,
      biome,
      notes: notesPool[Math.floor(Math.random() * notesPool.length)] ?? '',
    })
  }

  sp.observationCount = count
}
