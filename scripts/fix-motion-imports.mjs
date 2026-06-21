import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "src");

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.tsx?$/.test(entry) || full.endsWith("motion.tsx")) continue;

    const original = fs.readFileSync(full, "utf8");
    let next = original;
    next = next.replace(
      /import \{ motion \} from "framer-motion";/g,
      'import { motion } from "@/lib/motion";'
    );
    next = next.replace(
      /import \{ motion, AnimatePresence \} from "framer-motion";/g,
      'import { AnimatePresence } from "framer-motion";\nimport { motion } from "@/lib/motion";'
    );
    next = next.replace(
      /import \{ motion, useInView \} from "framer-motion";/g,
      'import { useInView } from "framer-motion";\nimport { motion } from "@/lib/motion";'
    );

    if (next !== original) fs.writeFileSync(full, next);
  }
}

walk(root);