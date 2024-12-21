import Link from "next/link";
import React from "react";

interface Props {}

const GithubLogin: React.FC<Props> = () => {
  return (
    <div className="">
      <div className="text-white text-lg">
        <p>Github not linked, Login to integrate with Github</p>
        <div className="my-4">
          <Link
            href={`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=admin:org repo`}
            className="bg-slate-500 px-4 py-2 rounded-md"
          >
            Login to GitHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GithubLogin;
