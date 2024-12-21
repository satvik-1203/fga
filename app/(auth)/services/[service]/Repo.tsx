import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import { headers } from "next/headers";
import GithubPermission from "./GithubPermission";

type Props = object;

export interface Collaborator {
  login: string;
  admin: boolean;
  permissions: {
    pull: boolean;
    push: boolean;
  };
}

interface Repository {
  org: string;
  repo: string;
  collaborators: Collaborator[];
}

const getRepos = async (): Promise<Repository[]> => {
  const res = await fetch("http://localhost:3000/api/github/functions/repo", {
    headers: await headers(),
  });
  const data = await res.json();
  return data;
};

const Repo: React.FC<Props> = async () => {
  const repos = await getRepos();

  return (
    <div className="text-white">
      <div className="">
        <div className="">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                GitHub Repositories
              </h1>
            </div>
          </div>
          <Accordion type="single" collapsible>
            {repos.map((repo) => (
              <AccordionItem key={repo.repo} value={repo.repo}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full justify-between items-center">
                    <div>
                      <span className="text-white">Repository:</span>{" "}
                      {repo.repo}
                    </div>
                    <div>
                      <span className="text-white">Organization:</span>{" "}
                      {repo.org}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <GithubPermission
                    collaborators={repo.collaborators}
                    org={repo.org}
                    repo={repo.repo}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Repo;
