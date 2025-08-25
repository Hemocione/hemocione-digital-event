<template>
  <div 
    class="background"
    style="position: relative; width: 1080px; height: 1920px; background-image: url('/images/illustrations/EventShare-background.png'); background-size: cover; background-position: center; background-repeat: no-repeat; color: #25282b; display: flex; align-items: center; justify-content: center;"
  >
    <div 
      class="info"
      style="position: absolute; top: 28%; width: 920px; display: flex; flex-direction: column; align-items: center;"
    >
      <div 
        class="slogan"
        style="font-size: 64px; font-weight: 700; color: #BB0A08; text-align: center; line-height: 1.1; margin-bottom: 40px;"
      >
        Doe sangue, salve vidas!
      </div>

      <div 
        class="info-box"
        style="width: 100%; background: #F4F1EA; border: 6px solid #3A3A3A; border-radius: 28px; padding: 36px 40px; display: flex; flex-direction: column; gap: 18px;"
      >
        <div 
          class="info-box-title"
          style="font-size: 52px; font-weight: 700; color: #25282b; text-align: left; line-height: 1.2;"
        >
          {{ title }}
        </div>

        <div 
          class="info-box-date"
          style="display: flex; align-items: flex-start; gap: 12px; font-size: 40px; color: #25282b; line-height: 1.3;"
        >
          <ElIcon 
            class="icon"
            style="width: 40px !important; height: 40px !important; color: #BB0A08; flex-shrink: 0; font-size: 40px !important;"
          >
            <ElIconCalendar style="width: 40px !important; height: 40px !important;" />
          </ElIcon>
          <span>{{ formattedDate }}</span>
        </div>

        <div 
          class="info-box-location"
          style="display: flex; align-items: flex-start; gap: 12px; font-size: 40px; color: #25282b; line-height: 1.3;"
        >
          <ElIcon 
            class="icon"
            style="width: 40px !important; height: 40px !important; color: #BB0A08; flex-shrink: 0; font-size: 40px !important;"
          >
            <ElIconLocation style="width: 40px !important; height: 40px !important;" />
          </ElIcon>
          <span>{{ addressText || 'Local do evento' }}</span>
        </div>
      </div>

      <div 
        class="registration-pill"
        style="margin-top: 40px; background: #BB0A08; color: white; padding: 12px 24px; border-radius: 40px; font-size: 38px; font-weight: 700; text-align: center; line-height: 1.2; white-space: nowrap;"
      >
        Se inscreva em eventos.hemocione.com.br
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })


const props = defineProps<{
  title: string
  addressText: string
  startAt: string
}>()

const monthNames = [
  'janeiro','fevereiro','março','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro'
] as const

const validDate = props.startAt ? new Date(props.startAt) : undefined

const pad = (n: number) => n.toString().padStart(2, '0')
const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${day} de ${month} de ${year} às ${hours}:${minutes}`
}

const formattedDate = validDate ? formatDate(validDate) : 'Data do evento'
</script>


