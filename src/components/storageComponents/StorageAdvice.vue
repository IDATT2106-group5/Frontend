<script>
export default {
  name: 'EmergencyChecklist',
  data() {
    return {
      items: [
        'Rent drikkevann lagret på kanner eller flasker.',
        'Mat som tåler lagring i romtemperatur.',
        'Grill, kokeapparat eller stormkjøkken.',
        'Varme klær, pledd, dyner og soveposer.',
        'Fyrstikker og stearinlys.',
        'Ved hvis du har vedovn eller peis.',
        'Gass- eller parafinovn som er beregnet for innendørs bruk er et alternativ til vedfyring.',
        'Avtale om overnatting hvis du ikke har alternativ oppvarming.',
        'Lommelykter eller hodelykter som går på batterier, sveiv eller solceller.',
        'DAB-radio som går på batterier, sveiv eller solceller.',
        'Legemidler og førstehjelpsutstyr.',
        'Jodtabletter (gjelder barn og voksne under 40 år, gravide og ammende).',
        'Hygieneartikler som våtservietter, håndsprit, bleier, dopapir og menstruasjonsprodukter.',
        'Batterier og ladet batteribank.',
        'Litt kontanter og flere betalingskort.',
        'Mat og vann til kjæledyr.',
        'Liste på papir med viktige telefonnummer som for eksempel nødnummer, legevakt, veterinær, familie, venner og naboer.'
      ],
      // Split items into two columns
      leftColumnItems() {
        const midpoint = Math.ceil(this.items.length / 2);
        return this.items.slice(0, midpoint);
      },
      rightColumnItems() {
        const midpoint = Math.ceil(this.items.length / 2);
        return this.items.slice(midpoint);
      }
    }
  },
  computed: {
    // Better to use computed properties for the column split
    leftItems() {
      const midpoint = Math.ceil(this.items.length / 2);
      return this.items.slice(0, midpoint);
    },
    rightItems() {
      const midpoint = Math.ceil(this.items.length / 2);
      return this.items.slice(midpoint);
    }
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <!-- Left Column -->
      <div>
        <ul class="space-y-4">
          <li v-for="(item, index) in leftItems" :key="index" class="flex items-start">
            <span class="inline-block w-2 h-2 rounded-full bg-[#2c3e50] mt-1.5 mr-3 flex-shrink-0"></span>
            <span class="text-black">{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Right Column -->
      <div>
        <ul class="space-y-4">
          <li v-for="(item, index) in rightItems" :key="'right-'+index" class="flex items-start">
            <span class="inline-block w-2 h-2 rounded-full bg-[#2c3e50] mt-1.5 mr-3 flex-shrink-0"></span>
            <span class="text-black">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>