import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import { checkEligibility } from "@/lib/actions/academic.action";
import AcademicDetailsForm from "@/components/AcademicDetailsForm";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>Please sign in to access interviews</h2>
        <Button asChild className="btn-primary mt-4">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Check eligibility
  const eligibilityCheck = await checkEligibility(user.id);
  
  // If user hasn't provided academic details, show the form
  if (eligibilityCheck.reasons.includes("Academic details not provided. Please complete your academic profile.")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AcademicDetailsForm userId={user.id} />
      </div>
    );
  }
  
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length ?? 0) > 0;

  // Show ineligibility message if not eligible
  if (!eligibilityCheck.isEligible) {
    return (
      <>
        <section className="card-cta">
          <div className="flex flex-col gap-6 max-w-lg">
            <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
            <p className="text-lg">
              Practice real interview questions & get instant feedback
            </p>
          </div>

          <Image
            src="/robot.png"
            alt="robo-dude"
            width={400}
            height={400}
            className="max-sm:hidden"
          />
        </section>

        <section className="flex flex-col gap-6 mt-8">
          <h2>Eligibility Requirements</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Not Eligible for Interviews</h3>
            <p className="text-red-700 mb-4">You don&apos;t meet the following criteria:</p>
            <ul className="list-disc list-inside text-red-600 space-y-1">
              {eligibilityCheck.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full" disabled={!eligibilityCheck.isEligible}>
        <Link href={eligibilityCheck.isEligible ? "/interview" : "#"}>
          Start an Interview
        </Link>
      </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
