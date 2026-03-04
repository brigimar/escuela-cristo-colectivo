type Props = { params: { slug: string } }
export default async function PostDetail({ params }: Props) {
  return <main>{params.slug}</main>
}
