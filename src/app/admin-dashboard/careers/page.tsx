import React from "react";
import CareerManagement from "./career-management/page";
// import JobApplications from "@/components/admin/JobApplications";

const CareerPage = () => {
  return (
    <div className="space-y-10">
      <section>
      
        <CareerManagement />
      </section>
      <section>
       
        {/* <JobApplications /> */}
      </section>
    </div>
  );
};

export default CareerPage;