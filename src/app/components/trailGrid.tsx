export default function TrailGrid (props: any) {
  const { trailList } = props;
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {trailList.map((trail: any) => {
        return (
          <div key={trail.id} className='group trail-card relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform hover:translate-y-[-8px] hover:shadow-xl'>
            <div className='flex flex-col p-6 space-y-4 h-full'>
              <h3 className='text-2xl font-semibold text-gray-800'>{trail.title}</h3>
              <p className='text-sm text-gray-600'>{trail.description}</p>
              <div className='mt-auto flex space-x-4 mt-4'>
                <a 
                  href={`${trail.gpxFileUrl}?download=1`}
                  className='w-full bg-blue-600 text-white text-center py-2 rounded-lg transition duration-300 hover:bg-blue-700'
                >
                  Stáhnout GPX
                </a>
                <a
                  href={'detailUrl'}
                  className='w-full bg-gray-600 text-white text-center py-2 rounded-lg transition duration-300 hover:bg-gray-700'
                >
                  Detaily
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}