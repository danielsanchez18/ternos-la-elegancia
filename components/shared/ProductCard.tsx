import Link from 'next/link'

export const ProductCard = () => {
  return (
    <Link href="/" className="overflow-hidden group hover:bg-gray-100">
          {/* Foto */}
          <div className="h-72 bg-black/10 overflow-hidden">
            {/* <img
              src="https://imgs.search.brave.com/vtc0mU4GKkbv1FIcRrktQJ8gfcZ9lwhRBBPBx9jZg3Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zLmFs/aWNkbi5jb20vQHNj/MDQva2YvSDY5ZWIx/MzFmMzliZjRjNTRi/ZGE1ZmU4NThlNzFj/NmYwTy5qcGdfMzAw/eDMwMC5qcGc"
              alt="Traje Clásico"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            /> */}
          </div>

          {/* Detalles */}
          <div className="p-4">
            <h3 className="text-xl font-semibold">Traje Clásico</h3>
            <p className="text-neutral-700 text-sm line-clamp-2">
              Un traje atemporal que combina elegancia y sofisticación para
              cualquier ocasión.
            </p>

            <div className="flex items-center gap-x-2 mt-4">
              <button className="btn-primary mr-auto">
                Comprar <span>S/. 450.00</span>
              </button>

              <button className="border border-black text-black py-2 px-2 hover:bg-gray-200 transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="size-6"
                >
                  <path
                    fill="currentColor"
                    d="M15 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-5-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
                  />
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M8.25 5.276V5a3.75 3.75 0 1 1 7.5 0v.276c.658.02 1.245.057 1.765.122c1.201.152 2.174.47 2.925 1.204q.376.368.664.81c.572.88.694 1.896.607 3.104c-.086 1.182-.382 2.666-.759 4.549l-.02.095c-.26 1.307-.468 2.347-.726 3.166c-.265.842-.604 1.524-1.17 2.076q-.293.285-.63.516c-.652.447-1.387.645-2.265.74c-.853.092-1.913.092-3.246.092h-1.79c-1.333 0-2.393 0-3.246-.092c-.878-.095-1.613-.293-2.265-.74a5 5 0 0 1-.63-.516c-.566-.552-.905-1.234-1.17-2.076c-.257-.819-.465-1.859-.727-3.166l-.019-.095c-.376-1.883-.673-3.367-.758-4.549c-.088-1.208.034-2.224.606-3.104a4.8 4.8 0 0 1 .664-.81c.752-.734 1.724-1.052 2.925-1.204c.52-.065 1.107-.102 1.765-.122M9.75 5a2.25 2.25 0 0 1 4.5 0v.252q-.636-.002-1.344-.002h-1.811q-.709 0-1.345.002zM4.608 7.675c.415-.405 1.008-.655 2.065-.789c1.07-.135 2.49-.136 4.476-.136h1.703c1.986 0 3.404.001 4.475.136c1.057.134 1.65.384 2.065.789q.257.252.454.554c.316.486.445 1.117.369 2.18c-.078 1.076-.355 2.467-.744 4.415c-.272 1.359-.465 2.32-.696 3.051c-.225.717-.465 1.14-.786 1.453a3.3 3.3 0 0 1-.43.353c-.37.253-.832.405-1.579.486c-.763.082-1.743.083-3.129.083H11.15c-1.386 0-2.366-.001-3.13-.083c-.746-.08-1.207-.233-1.577-.486a3.3 3.3 0 0 1-.431-.354c-.321-.312-.56-.735-.786-1.452c-.23-.732-.424-1.692-.695-3.051c-.39-1.948-.667-3.34-.744-4.416c-.077-1.062.052-1.693.368-2.179a3.3 3.3 0 0 1 .454-.554"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button className="border border-black text-black py-2 px-2 hover:bg-gray-200 transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="size-6"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M5.624 4.424C3.965 5.182 2.75 6.986 2.75 9.137c0 2.197.9 3.891 2.188 5.343c1.063 1.196 2.349 2.188 3.603 3.154q.448.345.885.688c.526.415.995.778 1.448 1.043s.816.385 1.126.385s.674-.12 1.126-.385c.453-.265.922-.628 1.448-1.043q.437-.344.885-.687c1.254-.968 2.54-1.959 3.603-3.155c1.289-1.452 2.188-3.146 2.188-5.343c0-2.15-1.215-3.955-2.874-4.713c-1.612-.737-3.778-.542-5.836 1.597a.75.75 0 0 1-1.08 0C9.402 3.882 7.236 3.687 5.624 4.424M12 4.46C9.688 2.39 7.099 2.1 5 3.059C2.786 4.074 1.25 6.426 1.25 9.138c0 2.665 1.11 4.699 2.567 6.339c1.166 1.313 2.593 2.412 3.854 3.382q.43.33.826.642c.513.404 1.063.834 1.62 1.16s1.193.59 1.883.59s1.326-.265 1.883-.59c.558-.326 1.107-.756 1.62-1.16q.396-.312.826-.642c1.26-.97 2.688-2.07 3.854-3.382c1.457-1.64 2.567-3.674 2.567-6.339c0-2.712-1.535-5.064-3.75-6.077c-2.099-.96-4.688-.67-7 1.399"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Link>
  )
}
