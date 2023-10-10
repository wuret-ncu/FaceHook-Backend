// import passport from 'passport';
// import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
// import { Users } from './entity/users';
// import myDataSource from './database/dbconfig'; 


// const configurePassport = () => {
//   const opts: any = {};
//   opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//   opts.secretOrKey = process.env.PASSPORT_SECRET;

//   // passport.use(
//   //   new JwtStrategy(opts, async (jwtPayload, done) => {
//   //     try {
//   //       const foundUser = await getRepository(Users).findOne({ where: { id: jwtPayload.id } });
//   //       if (foundUser) {
//   //         return done(null, foundUser);
//   //       } else {
//   //         return done(null, false);
//   //       }
//   //     } catch (e) {
//   //       return done(e, false);
//   //     }
//   //   })
//   // );
//   passport.use(
//     new JwtStrategy(opts, async (jwtPayload, done) => {
//       try {
//         const foundUser = await myDataSource.getRepository(Users).findOne({ where: { id: jwtPayload.id } });
//         if (foundUser) {
//           return done(null, foundUser);
//         } else {
//           return done(null, false);
//         }
//       } catch (e) {
//         return done(e, false);
//       }
//     })
//   );

// };

// export default configurePassport;

import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Users } from './entity/users'; // 假設 User 實體的匯入路徑正確
import myDataSource from './database/dbconfig';

const configurePassport = () => {
  const opts: any = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const userRepository: Repository<Users> = myDataSource.getRepository(Users);
        const foundUser = await userRepository.findOne({ where: { id: jwtPayload.id } });
        if (foundUser) {
          return done(null, foundUser);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};

export default configurePassport;