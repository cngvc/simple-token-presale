import Swal from 'sweetalert2'

export const CustomSwal = Swal.mixin({
  customClass: {
    confirmButton: 'font-urbanist',
    title: 'font-space-grotesk text-white t_2xl',
    popup: 'font-urbanist bg-black/80 backdrop-blur rounded-md',
    htmlContainer: 'font-open-san t_base !text-white'
  }
})
