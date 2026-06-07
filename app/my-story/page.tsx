import { redirect } from 'next/navigation'

// /my-story has been replaced by /about
export default function MyStoryRedirect() {
  redirect('/about')
}
