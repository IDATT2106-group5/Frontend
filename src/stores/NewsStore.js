import { defineStore } from 'pinia'

const mockNewsData = [
  {
    id: 1,
    title: "Viktig sikkerhetsvarsel",
    url: "https://example.com/safety-alert",
    created_at: "2025-05-01T08:00:00Z",
    content: "Et alvorlig stormvarsel er utstedt for sørlige regioner. Vennligst hold deg innendørs.",
    source: "Meteorologisk Institutt"
  },
  {
    id: 2,
    title: "Oppdateringer om strømbrudd",
    url: "https://example.com/power-outage",
    created_at: "2024-11-02T10:30:00Z",
    content: "Mannskap jobber med å gjenopprette strømmen i østlige distrikter etter gårsdagens storm.",
    source: "Lokalt Kraftselskap"
  },
  {
    id: 3,
    title: "Nødhjelp tilgjengelig",
    url: "https://example.com/emergency-supplies",
    created_at: "2024-11-03T14:15:00Z",
    content: "Nødhjelp deles ut på samfunnshuset fra kl. 9 til 17.",
    source: "Beredskapsavdelingen"
  },
  {
    id: 4,
    title: "Flomvarsel oppgradert",
    url: "https://edition.cnn.com/2025/05/05/sport/naomi-osaka-wins-first-title-maternity-spt-intl",
    created_at: "2024-11-05T06:45:00Z",
    content: "Flomvarselet for Trøndelag er oppgradert til rødt nivå. Evakuering anbefales i lavtliggende områder.",
    source: "Norges Vassdrags- og Energidirektorat"
  },
  {
    id: 5,
    title: "Midlertidig skole stengt",
    url: "https://example.com/school-closure",
    created_at: "2024-11-05T07:30:00Z",
    content: "Alle skoler i kommunen forblir stengt inntil videre på grunn av flomfare.",
    source: "Utdanningsdirektoratet"
  },
  {
    id: 6,
    title: "Trafikkmeldinger",
    url: "https://example.com/traffic-update",
    created_at: "2024-11-06T09:15:00Z",
    content: "E6 er stengt mellom Trondheim og Stjørdal grunnet oversvømmelse. Bruk alternative ruter.",
    source: "Statens Vegvesen"
  },
  {
    id: 7,
    title: "Drikkevann kokevarsel",
    url: "https://example.com/water-advisory",
    created_at: "2024-11-07T11:20:00Z",
    content: "Alle innbyggere må koke drikkevann i minst ett minutt før bruk grunnet mulig forurensning.",
    source: "Kommunalt Vannverk"
  },
  {
    id: 8,
    title: "Midlertidige boenheter tilgjengelig",
    url: "https://example.com/temporary-housing",
    created_at: "2024-11-08T16:00:00Z",
    content: "Midlertidige boenheter er nå tilgjengelige for familier berørt av flommen. Registrer deg ved rådhuset.",
    source: "Krisesenteret"
  },
  {
    id: 9,
    title: "Vaksinasjonstilbud utvidet",
    url: "https://example.com/vaccination-program",
    created_at: "2024-11-10T08:45:00Z",
    content: "Ekstra vaksinasjonstilbud mot vannbårne sykdommer er nå tilgjengelig ved alle helsestasjoner.",
    source: "Folkehelseinstituttet"
  },
  {
    id: 10,
    title: "Oppstart av ryddearbeid",
    url: "https://example.com/cleanup-efforts",
    created_at: "2024-11-12T09:30:00Z",
    content: "Frivillige kan melde seg til ryddearbeid i sentrum. Oppmøte ved rådhuset kl. 08:00 daglig.",
    source: "Kommunal Krisestab"
  },
  {
    id: 11,
    title: "Redusert togtrafikk",
    url: "https://example.com/train-service-reduction",
    created_at: "2024-11-13T07:15:00Z",
    content: "Begrenset togtrafikk mellom Oslo og Trondheim grunnet skader på jernbanelinjen. Forsinkelser må påregnes.",
    source: "Bane NOR"
  },
  {
    id: 12,
    title: "Åpningstider krisesenter",
    url: "https://example.com/crisis-center-hours",
    created_at: "2024-11-14T13:40:00Z",
    content: "Krisesenteret vil være åpent døgnet rundt frem til 20. november for de som trenger assistanse.",
    source: "Kommunal Krisestab"
  },
  {
    id: 13,
    title: "Psykisk helsestøtte",
    url: "https://example.com/mental-health-support",
    created_at: "2024-11-15T10:00:00Z",
    content: "Gratis psykologtjenester tilbys for de som er berørt av katastrofen. Ring 800 12 345 for avtale.",
    source: "Helsedirektoratet"
  },
  {
    id: 14,
    title: "Gjenåpning av hovedveier",
    url: "https://example.com/road-reopening",
    created_at: "2024-11-16T15:30:00Z",
    content: "E6 er nå delvis gjenåpnet for trafikk, med redusert hastighet og ett kjørefelt i hver retning.",
    source: "Statens Vegvesen"
  },
  {
    id: 15,
    title: "Økonomisk støtte tilgjengelig",
    url: "https://example.com/financial-aid",
    created_at: "2024-11-17T09:20:00Z",
    content: "Søknader om økonomisk katastrofestøtte kan nå leveres online eller ved servicekontoret.",
    source: "NAV"
  },
  {
    id: 16,
    title: "Skoleåpning utsatt",
    url: "https://example.com/school-reopening-delayed",
    created_at: "2024-11-18T14:10:00Z",
    content: "Gjenåpning av skoler utsettes til 27. november for å sikre trygge forhold for elever og ansatte.",
    source: "Utdanningsdirektoratet"
  },
  {
    id: 17,
    title: "Luftkvalitetsvarsel",
    url: "https://example.com/air-quality-warning",
    created_at: "2024-11-19T08:35:00Z",
    content: "Dårlig luftkvalitet forventes i berørte områder. Personer med luftveisplager bør holde seg innendørs.",
    source: "Miljødirektoratet"
  },
  {
    id: 18,
    title: "Gjenopptakelse av vannforsyning",
    url: "https://example.com/water-supply-resumption",
    created_at: "2024-11-20T11:25:00Z",
    content: "Normal vannforsyning er gjenopprettet i sentrale områder. Kokevarselet gjelder fortsatt.",
    source: "Kommunalt Vannverk"
  },
  {
    id: 19,
    title: "Gratis barnepass",
    url: "https://example.com/childcare-services",
    created_at: "2024-11-21T09:50:00Z",
    content: "Gratis barnepasstjenester tilbys for familier involvert i gjenoppbyggingsarbeid. Registrer deg ved rådhuset.",
    source: "Kommunal Beredskap"
  },
  {
    id: 20,
    title: "Opphevelse av kokevarsel",
    url: "https://example.com/boil-water-advisory-lifted",
    created_at: "2024-11-22T10:00:00Z",
    content: "Kokevarselet for drikkevann er nå opphevet i alle områder etter omfattende testing.",
    source: "Kommunalt Vannverk"
  },
  {
    id: 21,
    title: "Skredalarm aktivert",
    url: "https://example.com/landslide-warning",
    created_at: "2024-11-23T05:15:00Z",
    content: "Skredalarm er aktivert for fjellområdene rundt Ålesund. Evakuering pågår i utsatte områder.",
    source: "Norges Geologiske Undersøkelse"
  },
  {
    id: 22,
    title: "Sykehuskapasitet utvidet",
    url: "https://example.com/hospital-capacity",
    created_at: "2024-11-24T13:05:00Z",
    content: "Feltlasarett er etablert ved idrettshallen for å håndtere økt antall pasienter.",
    source: "Helse Midt-Norge"
  },
  {
    id: 23,
    title: "Avslutning av nødtilstand",
    url: "https://example.com/emergency-status-update",
    created_at: "2024-11-30T16:00:00Z",
    content: "Nødtilstanden er offisielt avsluttet. Gjenoppbyggingsarbeidet fortsetter i berørte områder.",
    source: "Fylkesmannen"
  }
]
export const useNewsStore = defineStore('news', {
  state: () => ({
    newsItems: [],
    loading: false,
    error: null
  }),

  getters: {
    allNews: (state) => state.newsItems,
    unreadNews: (state) => state.newsItems.filter(item => !item.read),
    readNews: (state) => state.newsItems.filter(item => item.read)
  },

  actions: {
    saveReadStatusToLocalStorage() {
      const readIds = this.newsItems
        .filter(item => item.read)
        .map(item => item.id)
      localStorage.setItem('readNewsIds', JSON.stringify(readIds))
    },

    loadReadStatusFromLocalStorage() {
      try {
        const readIdsString = localStorage.getItem('readNewsIds')
        if (readIdsString) {
          const readIds = JSON.parse(readIdsString)
          this.newsItems.forEach(item => {
            item.read = readIds.includes(item.id)
          })
        }
      } catch (error) {
        console.error('Error loading read status from localStorage:', error)
      }
    },

    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('/api/news')
        if (!response.ok) throw new Error('Failed to fetch news')
        const data = await response.json()
        this.newsItems = data.map(item => ({ ...item, read: false }))
      } catch (err) {
        this.newsItems = mockNewsData
        this.error = err.message || 'Unknown error'
      } finally {
        this.loading = false
        this.loadReadStatusFromLocalStorage()
      }
    },

    markAsRead(id) {
      console.log('Marking as read:', id)
      const item = this.newsItems.find(news => news.id === id)
      if (item) {
        item.read = true
        this.saveReadStatusToLocalStorage()
      }
    }
  }
})

