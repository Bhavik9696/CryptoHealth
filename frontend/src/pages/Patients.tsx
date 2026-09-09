import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientService } from '@/services/patient.service'
import { PatientTable } from '@/components/patients/PatientTable'
import { PatientSearch } from '@/components/patients/PatientSearch'
import { Loading } from '@/components/common/Loading'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { QUERY_KEYS } from '@/lib/constants'

export default function Patients() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PATIENTS, search, page],
    queryFn: () => patientService.getPatients({ search, page, limit }),
  })

  const patients = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Patients</h2>
          <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total patients</p>
        </div>
      </div>

      <div className="max-w-md">
        <PatientSearch onSearch={(q) => { setSearch(q); setPage(1) }} />
      </div>

      {isLoading ? (
        <Loading text="Loading patients..." />
      ) : isError ? (
        <ErrorState
          title="Unable to load patients"
          message="Something went wrong while fetching the patient list."
          onRetry={refetch}
        />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={search ? `No patients matched "${search}".` : 'No patients have been registered yet.'}
        />
      ) : (
        <>
          <PatientTable patients={patients} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
