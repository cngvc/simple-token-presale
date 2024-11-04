import SimpleLayout from '@/components/Layouts/SimpleLayout'
import Section from '@/components/Section'

const PP = () => {
  return (
    <SimpleLayout>
      <Section className='pt-[15%] md:pt-[7.5rem] text-white z-10'>
        <h1 className='mb-10'>Privacy Policy</h1>

        <div className='t_base'>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
          standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
          make a type specimen book. It has survived not only five centuries, but also the leap into electronic
          typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
          sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </div>
        <br />
      </Section>
    </SimpleLayout>
  )
}

export default PP
