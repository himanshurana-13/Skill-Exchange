import { FaUsers } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";

const skills = [
  { title: "Web Development", description: "Frontend, Backend, Full Stack", users: "2.3k", rating: "4.8" },
  { title: "Graphic Design", description: "UI/UX, Branding, Illustration", users: "1.8k", rating: "4.7" },
  { title: "Digital Marketing", description: "SEO, Social Media, Content", users: "1.5k", rating: "4.6" },
];

const PopularSkills = () => {
  return (
    <section className="p-12">
      <h2 className="text-3xl font-bold text-center">Popular Skills</h2>
      <p className="text-center text-gray-500 mt-2">
        Discover the most sought-after skills in our community
      </p>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {skills.map((skill, index) => (
          <div key={index} className="p-6 border rounded-lg shadow-md bg-white">
            <h3 className="font-semibold text-lg">{skill.title}</h3>
            <p className="text-gray-600">{skill.description}</p>

            <div className="flex justify-between items-center mt-4 text-gray-700">
              <div className="flex items-center gap-2">
                <FaUsers className="text-gray-500" />
                <span>{skill.users} users</span>
              </div>
              <div className="flex items-center gap-1">
                <AiFillStar className="text-yellow-500" />
                <span>{skill.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md">
          View All Skills →
        </button>
      </div>
    </section>
  );
};

export default PopularSkills;
