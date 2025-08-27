<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  ctaText?: string
  storeUrl?: string
  icon?: string

  top?: number
  right?: number          
  rightClosed?: number    
  edgeNudge?: number      
  height?: number
  openWidth?: number
  peekWidth?: number

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
  openWidth: 320,
  peekWidth: 120,

  lineColor: '#E54B4B',
  lineWidth: 2,
  radius: 28,

  useElementPlus: false,
})

const open = ref(false)

const vars = computed(() => ({
  '--top': props.top + 'px',
  '--right': props.right + 'px',                 
  '--rightClosed': props.rightClosed + 'px',     
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
      <button v-if="open" class="close" aria-label="Fechar" @click="open = false">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      <!-- conteúdo (logo e textos só quando aberto) -->
      <div class="logo-wrap">
        <img class="logo" :src="icon" alt="" @error="(e:any)=> e.target?.remove?.()" />
      </div>
      <div class="text" @click="open = true">
        <strong class="title">{{ title }}</strong>
      </div>

      <component
        :is="useElementPlus ? 'el-button' : 'button'"
        v-show="open"
        class="cta"
        :type="useElementPlus ? 'danger' : null"
        :round="useElementPlus ? true : null"
        :size="useElementPlus ? 'small' : null"
        @click="goStore"
      >
        {{ ctaText }}
      </component>

      <button v-if="!open" class="hit" aria-label="Abrir" @click="open = true"></button>
    </div>

    <div v-if="open" class="overlay" @click="open = false" aria-hidden="true"></div>
  </teleport>
</template>

<style scoped>
.pill {
  position: fixed;
  top: var(--top);
  right: calc(var(--rightClosed) - var(--nudge)); 
  height: var(--h);
  width: var(--peekW);                            
  background: var(--hemo-color-secondary);
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  z-index: 9999;

  border: var(--stroke) solid var(--hemo-color-pinkish-red);
  border-right: 0;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: var(--radius);
  border-top-right-radius: 0;                   
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
  transform: translateX(-50%);                    
  width: min(var(--openW), 90vw);                  
  border-right: var(--stroke) solid var(--color);
  border-top-right-radius: var(--radius);          
  border-bottom-right-radius: var(--radius);
  overflow: visible;  
}

.logo { width: 32px; height: 32px; border-radius: 9999px; }
.text { min-width: 0; cursor: pointer; }
.title { display:block; font-size:18px; line-height:1.1;color: var(--hemo-color-black-100) }

button.cta {
  white-space: nowrap; border: 0; padding: 8px 8px; border-radius: 8px;
  font-weight: 600; background: var(--hemo-color-primary-medium); color:#fff; cursor: pointer;
}

.close {
  position: absolute; top: -10px; left: -10px;
  width: 28px; height: 28px; border: 0; border-radius: 9999px;
  background:#fff; box-shadow: 0 6px 16px rgba(0,0,0,.18);
  cursor: pointer; font-size:18px; line-height:28px;
}

.hit { position: absolute; inset: 0; border: 0; background: transparent; cursor: pointer; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.2); z-index: 9998; }

.pill { z-index: 9999; }

.pill :deep(.el-button) {
  --el-color-danger: var(--color);
  --el-button-hover-bg-color: color-mix(in oklab, var(--color), #fff 20%);
}

.logo-wrap {
  width: 44px;                 
  height: 44px;
  border-radius: 9999px;      
  background: #fff;           
  box-shadow: 0 0 0 2px #C9CDD3; 
  display: grid;
  place-items: center;         
}

.close {
  position: absolute;
  top: -5px;                
  left: -5px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 9999px;
  background: var(--hemo-color-secondary);           
  box-shadow:
    0 0 0 4px var(--hemo-color-pinkish-red),  
    0 6px 16px rgba(0,0,0,.18);
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 1;             
}

.close svg {
  width: 17px;
  height: 17px;
  stroke: #222;              
  stroke-width: 3;
  stroke-linecap: round;
  fill: none;
}

.close:hover { filter: brightness(0.98); }
.close:active { transform: scale(0.98); }
.close:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--color), #fff 35%);
  outline-offset: 2px;
}
</style>
