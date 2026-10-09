// Handles GET (fetching data by date) and POST (saving EOD earning sheet)
export async function getEarningByDate(dateStr: string) {
  const response = await fetch(`/api/earning?date=${dateStr}`);
  if (!response.ok) return null;
  return await response.json();
}

export async function saveEarningSheet(data: any) {
  const response = await fetch('/api/earning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}