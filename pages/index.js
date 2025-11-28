import Head from 'next/head'
import Platform from '../components/Platform'

export default function Home() {
  return (
    <>
      <Head>
        <title>Coopération Sociale - Plateforme d'entraide</title>
        <meta name="description" content="Générez des revenus passifs ensemble sur les réseaux sociaux" />
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Platform />
    </>
  )
}