import type { ReactElement } from 'react'
import Layout from '@/components/Layout'
import type { NextPageWithLayout } from '@/pages/_app'

const OverView: NextPageWithLayout = () => {
  return (
    <p>hello world</p>
  );
}

OverView.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
    	{page}
    </Layout>
  )
}

export default OverView
