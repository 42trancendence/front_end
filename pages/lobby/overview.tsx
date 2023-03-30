import Layout from '@/components/Layout'

export default function OverView({pageProps}: {pageProps?:any}) {
  return (
    <Layout pageProps={pageProps}>
      <p className='text-white'>this is lobby overview</p>
    </Layout>
  )
}
