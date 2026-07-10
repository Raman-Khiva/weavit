interface PageProps {
  params: {
    id: string
  }
}

const Page = ({ params }: PageProps) => {
  const title = params.id.replace(/-/g, " ")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold capitalize">{title}</h1>
      <p className="text-muted-foreground">
        Dynamic habit view for: <span className="font-semibold">{params.id}</span>
      </p>
    </div>
  )
}

export default Page
