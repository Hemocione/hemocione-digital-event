<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  ctaText?: string
  storeUrl?: string
  icon?: string

  // posição / tamanhos
  top?: number
  right?: number          
  rightClosed?: number    
  edgeNudge?: number      
  height?: number
  openWidth?: number
  peekWidth?: number

  // estilo
  lineColor?: string
  lineWidth?: number
  radius?: number

  useElementPlus?: boolean
}>(), {
  title: 'Hemocione',
  ctaText: 'INSTALAR APP',
  storeUrl: '#',
  icon: '/images/logo.svg',

  top: 96,
  right: 16,
  rightClosed: 0,
  edgeNudge: 0,      
  height: 56,
  openWidth: 420,
  peekWidth: 120,

  lineColor: '#E54B4B',
  lineWidth: 3,
  radius: 28,

  useElementPlus: false,
})

const open = ref(false)

const vars = computed(() => ({
  '--top': props.top + 'px',
  '--right': props.right + 'px',                 // aberto
  '--rightClosed': props.rightClosed + 'px',     // fechado
  '--nudge': props.edgeNudge + 'px',
  '--h': props.height + 'px',
  '--openW': props.openWidth + 'px',
  '--peekW': props.peekWidth + 'px',
  '--stroke': props.lineWidth + 'px',
  '--radius': props.radius + 'px',
  '--color': props.lineColor,
}))

function goStore () { window.open(props.storeUrl, '_blank') }
onMounted(() => { open.value = false })
</script>

<template>
  <teleport to="body">
    <div class="pill" :class="{ open }" :style="vars" role="dialog" aria-live="polite">
      <!-- fechar (só quando aberto) -->
      <button v-if="open" class="close" aria-label="Fechar" @click="open = false">×</button>

      <!-- conteúdo (logo e textos só quando aberto) -->
      <img class="logo" :src="icon" alt="" @error="(e:any)=> e.target?.remove?.()" />
      <div class="text" @click="open = true">
        <strong class="title">{{ title }}</strong>
      </div>

      <component
        :is="useElementPlus ? 'el-button' : 'button'"
        v-if="open"
        class="cta"
        :type="useElementPlus ? 'danger' : null"
        :round="useElementPlus ? true : null"
        :size="useElementPlus ? 'small' : null"
        @click="goStore"
      >
        {{ ctaText }}
      </component>

      <!-- hit area no fechado -->
      <button v-if="!open" class="hit" aria-label="Abrir" @click="open = true"></button>
    </div>

    <!-- overlay -->
    <div v-if="open" class="overlay" @click="open = false" aria-hidden="true"></div>
  </teleport>
</template>

<style scoped>
/* cápsula fixa, com traço próprio; lateral direita reta */
.pill {
  position: fixed;
  top: var(--top);
  right: calc(var(--rightClosed) - var(--nudge)); /* FECHADO: colado na direita */
  height: var(--h);
  width: var(--peekW);                             /* largura no fechado */
  background: #fff;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  z-index: 9999;

  border: var(--stroke) solid var(--color);
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: var(--radius);
  border-top-right-radius: 0;                      /* direita reta no fechado */
  border-bottom-right-radius: 0;

  box-shadow: 0 14px 40px rgba(0,0,0,.20);
  overflow: hidden;

  transition:
    width .35s cubic-bezier(.2,.8,.2,1),
    right .35s cubic-bezier(.2,.8,.2,1),
    left .35s cubic-bezier(.2,.8,.2,1),
    transform .35s cubic-bezier(.2,.8,.2,1);
}

.pill.open {
  left: 50%;
  right: auto;
  transform: translateX(-50%);                     /* ABERTO: centraliza no X */
  width: min(var(--openW), 90vw);                  /* largura no aberto */
  border-top-right-radius: var(--radius);          /* direita curva no aberto */
  border-bottom-right-radius: var(--radius);
}

/* conteúdo */
.logo { width: 40px; height: 40px; border-radius: 9999px; }
.text { min-width: 0; cursor: pointer; }
.title { display:block; font-size:18px; line-height:1.1;color: var(--hemo-color-black-100) }

button.cta {
  border: 0; padding: 8px 12px; border-radius: 8px;
  font-weight: 600; background: var(--color); color:#fff; cursor: pointer;
}

/* botão X */
.close {
  position: absolute; top: -10px; left: -10px;
  width: 28px; height: 28px; border: 0; border-radius: 9999px;
  background:#fff; box-shadow: 0 6px 16px rgba(0,0,0,.18);
  cursor: pointer; font-size:18px; line-height:28px;
}

/* área clicável no fechado */
.hit { position: absolute; inset: 0; border: 0; background: transparent; cursor: pointer; }

/* overlay */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.2); z-index: 9998; }

/* garante que a cápsula fique por cima */
.pill { z-index: 9999; }

/* (opcional) se usar Element Plus no CTA, harmoniza a cor */
.pill :deep(.el-button) {
  --el-color-danger: var(--color);
  --el-button-hover-bg-color: color-mix(in oklab, var(--color), #fff 20%);
}
</style>
