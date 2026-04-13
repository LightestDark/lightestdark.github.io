import { projects } from "@/data/projects";
import ProjectClient from "./project-client";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function Page() {
  return <ProjectClient />;
}
