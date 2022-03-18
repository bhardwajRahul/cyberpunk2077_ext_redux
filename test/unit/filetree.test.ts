/* eslint-disable no-underscore-dangle */
import path from "path";
import {
  Glob,
  dirWithSomeIn,
  fileTreeFromPaths,
  findAllSubdirsWithSome,
  findTopmostSubdirsWithSome,
  findAllFiles,
  FILETREE_ROOT,
  FILETREE_TOPLEVEL,
  filesIn,
  pathInTree,
  fileCount,
} from "../../src/filetree";

const paths = [
  path.normalize("topf1.seek"),
  path.normalize("topf2.seek"),
  path.normalize("topf3.notseek"),
  path.normalize("sub1/"),
  path.normalize("sub1/sub12/"),
  path.normalize("sub1/sub12/f12.seek"),
  path.normalize("sub1/sub12/f12.notseek"),
  path.normalize("sub2/"),
  path.normalize("sub2/sub22/f22.seek"),
  path.normalize("sub2/sub23/f23.notseek"),
  path.normalize("sub2/emptydir/"),
  path.normalize("sub2/f24.seek"),
  path.normalize("sub2/f2r.notseek"),
  path.normalize("sub2/x2h"),
];

const filePaths = paths.filter((p) => !p.endsWith(path.sep));
const dirPaths = paths.filter((p) => p.endsWith(path.sep));

const emptyDirPaths = [path.normalize("sub2/emptydir/")];
const nonEmptyDirPaths = dirPaths.filter((d) => !emptyDirPaths.includes(d));

const matchSeek = (f) => path.extname(f) === ".seek";

describe("FileTree", () => {
  test("fileCount equals the number of non-directory paths", () => {
    const fileTree = fileTreeFromPaths(paths);

    const originalWithoutDirs = paths.filter((p) => !p.endsWith(path.sep));

    expect(fileCount(fileTree)).toEqual(originalWithoutDirs.length);
  });

  test("doesn't store directories as values", () => {
    const fileTree = fileTreeFromPaths(paths);

    expect(fileTree._kt.getSub(FILETREE_ROOT)).toEqual([
      path.normalize("topf1.seek"),
      path.normalize("topf2.seek"),
      path.normalize("topf3.notseek"),
      path.normalize("sub1/sub12/f12.seek"),
      path.normalize("sub1/sub12/f12.notseek"),
      path.normalize("sub2/f24.seek"),
      path.normalize("sub2/f2r.notseek"),
      path.normalize("sub2/x2h"),
      path.normalize("sub2/sub22/f22.seek"),
      path.normalize("sub2/sub23/f23.notseek"),
    ]);
  });

  test("has expected root and top-level", () => {
    const fileTree = fileTreeFromPaths(paths);

    const rootNode = fileTree._kt._getNode("");
    const topNode = fileTree._kt._getNode(".");

    expect(rootNode.key).toBe("");
    expect(topNode.key).toBe(".");
    expect(topNode.parent.key).toBe("");
    expect(topNode.parent.parent).toBeUndefined();
  });

  test("pathInTree looks for files", () => {
    const fileTree = fileTreeFromPaths(paths);
    filePaths.forEach((p) => {
      expect(pathInTree(p, fileTree)).toBeTruthy();
    });

    expect(pathInTree(path.normalize("foo"), fileTree)).toBeFalsy();
    expect(pathInTree(path.normalize("topf1"), fileTree)).toBeFalsy();
    expect(pathInTree(path.normalize("sub2/nonesuch/"), fileTree)).toBeFalsy();
  });

  test("pathInTree looks for directories IF they have files somewhere under them", () => {
    const fileTree = fileTreeFromPaths(paths);

    nonEmptyDirPaths.forEach((d) => {
      expect(pathInTree(d, fileTree)).toBeTruthy();
    });

    emptyDirPaths.forEach((d) => {
      expect(pathInTree(d, fileTree)).toBeFalsy();
    });

    expect(pathInTree(path.normalize("foo"), fileTree)).toBeFalsy();
    expect(pathInTree(path.normalize("topf1"), fileTree)).toBeFalsy();
    expect(pathInTree(path.normalize("sub2/nonesuch/"), fileTree)).toBeFalsy();
  });

  test("path lookup", () => {
    const fileTree = fileTreeFromPaths(paths);

    expect(filesIn(path.normalize("."), Glob.Any, fileTree)).toEqual([
      "topf1.seek",
      "topf2.seek",
      "topf3.notseek",
    ]);

    expect(dirWithSomeIn(path.normalize("."), matchSeek, fileTree)).toBeTruthy();

    expect(filesIn(path.normalize("sub1/"), Glob.Any, fileTree)).toEqual([]);

    expect(dirWithSomeIn(path.normalize("sub1/"), matchSeek, fileTree)).toBeFalsy();

    expect(filesIn(path.normalize("sub1/sub12/"), Glob.Any, fileTree)).toEqual([
      "sub1\\sub12\\f12.seek",
      "sub1\\sub12\\f12.notseek",
    ]);

    expect(
      dirWithSomeIn(path.normalize("sub1/sub12/"), matchSeek, fileTree),
    ).toBeTruthy();

    expect(filesIn(path.normalize("sub2/"), Glob.Any, fileTree)).toEqual([
      "sub2\\f24.seek",
      "sub2\\f2r.notseek",
      "sub2\\x2h",
    ]);

    expect(dirWithSomeIn(path.normalize("sub2/"), matchSeek, fileTree)).toBeTruthy();

    expect(filesIn(path.normalize("sub2/sub22"), Glob.Any, fileTree)).toEqual([
      "sub2\\sub22\\f22.seek",
    ]);

    expect(
      dirWithSomeIn(path.normalize("sub2/sub22/"), matchSeek, fileTree),
    ).toBeTruthy();
  });

  test("findAllFiles", () => {
    const fileTree = fileTreeFromPaths(paths);

    const found = findAllFiles(matchSeek, fileTree);

    expect(found).toEqual([
      path.normalize("topf1.seek"),
      path.normalize("topf2.seek"),
      path.normalize("sub1/sub12/f12.seek"),
      path.normalize("sub2/sub22/f22.seek"),
      path.normalize("sub2/f24.seek"),
    ]);
  });

  test("findAllSubdirsWithSome excluding toplevel", () => {
    const fileTree = fileTreeFromPaths(paths);

    const found = findAllSubdirsWithSome(FILETREE_TOPLEVEL, matchSeek, fileTree);

    expect(found).toEqual([
      path.normalize("sub1/sub12"),
      path.normalize("sub2/sub22"),
      path.normalize("sub2"),
    ]);
  });

  test("findAllSubDirsWithSome including toplevel", () => {
    const fileTree = fileTreeFromPaths(paths);

    const found = findAllSubdirsWithSome(FILETREE_ROOT, matchSeek, fileTree);

    expect(found).toEqual([
      path.normalize("."),
      path.normalize("sub1/sub12"),
      path.normalize("sub2/sub22"),
      path.normalize("sub2"),
    ]);
  });

  test("findTopmostSubdirsWithSome excluding toplevel", () => {
    const fileTree = fileTreeFromPaths(paths);

    const found = findTopmostSubdirsWithSome(FILETREE_TOPLEVEL, matchSeek, fileTree);

    expect(found).toEqual([path.normalize("sub1/sub12"), path.normalize("sub2")]);
  });

  test("findTopmostSubdirsWithSome including toplevel", () => {
    const fileTree = fileTreeFromPaths(paths);

    const found = findTopmostSubdirsWithSome(FILETREE_ROOT, matchSeek, fileTree);

    expect(found).toEqual([
      path.normalize("."),
      path.normalize("sub1/sub12"),
      path.normalize("sub2"),
    ]);
  });
});