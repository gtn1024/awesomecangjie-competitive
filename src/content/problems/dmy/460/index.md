---
oj: dmy
pid: '460'
title: '[R74D] 爱吃白饭的大肥鱼3'
difficulty: 普及-
tags:
  - 搜索
  - 回溯
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 20$，$|x_0|, |y_0|, |x_i|, |y_i| \le 10^9$，所有白饭的位置两两不同，且没有白饭位于 $(x_0, y_0)$。

## 思路

整个过程里唯一需要做决定的地方只有一处：吃完一碗白饭后向左转还是向右转。其余每一步都是确定的——给定当前位置与朝向，大肥鱼一定会游到该方向上距离最近的那碗未被吃掉的白饭处。

于是直接模拟搜索。状态为「当前位置、当前朝向、已吃掉的白饭集合」，其中当前位置要么是初始位置，要么是某碗白饭的位置，因此位置与朝向合起来只有 $(n+1)\times 4$ 种取值。

从一个状态出发：

1. 在剩余的白饭中找出与当前位置共线、且位于当前朝向一侧的白饭里距离最近的一碗。若不存在，则大肥鱼停在此处，用已吃数量更新答案后结束这一分支。
2. 否则将它标记为已吃掉，位置移到它上面，再分别按「向左转 90 度」和「向右转 90 度」递归两个分支；回溯时撤销标记。

每吃一碗白饭深度加一，递归深度不超过 $n$；每个结点只花 $O(n)$ 扫描一遍剩余白饭来定位最近的那碗，然后分出两支。搜索树结点数上界为 $2^{n+1}$，在 $n\le 20$ 时足够轻松。实际上随着白饭被吃掉，同一直线上的候选会迅速消失，大量分支很早就终止，真实访问的结点数远小于这个上界（即便取最密集的 $4\times 5$ 网格，也不过数千个结点），因此不需要记忆化。

几个实现细节：

- 判断「共线且在朝向一侧」只需要坐标相等与大小比较，不必算欧氏距离；同行同向的白饭中距离最近的那碗，用坐标差的绝对值比较即可，坐标绝对值不超过 $10^9$，64 位整数足够。
- 白饭位置两两不同，因此同方向上的最近白饭唯一，不存在并列。
- 若初始朝向上前方没有白饭，大肥鱼吃不到任何东西，答案为 $0$。

## 复杂度

时间 $O(2^n \cdot n)$：最坏情况下每个状态扫一遍白饭并分出两支，$n \le 20$ 时为 $2\times 10^7$ 量级，实际远小于此；空间 $O(n)$，用于递归栈与已吃标记数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

class Solver {
    var n: Int64
    var xs: Array<Int64>
    var ys: Array<Int64>
    var visited: Array<Bool>
    var best: Int64

    init(pxs: Array<Int64>, pys: Array<Int64>) {
        xs = pxs
        ys = pys
        n = Int64(pxs.size) - 1
        visited = Array<Bool>(pxs.size, { _ => false })
        best = 0
    }

    // idx: 当前位置（0..n-1 为白饭，n 为初始位置）
    // dir: 0=U 1=R 2=D 3=L  cnt: 已吃掉的数量
    func dfs(idx: Int64, dir: Int64, cnt: Int64): Unit {
        if (cnt > best) {
            best = cnt
        }
        let cx = xs[idx]
        let cy = ys[idx]
        var ni: Int64 = -1
        var nd: Int64 = 0
        var i: Int64 = 0
        while (i < n) {
            if (!visited[i]) {
                var ok = false
                var dist: Int64 = 0
                if (dir == 0) {
                    if (xs[i] == cx && ys[i] > cy) {
                        ok = true
                        dist = ys[i] - cy
                    }
                } else if (dir == 1) {
                    if (ys[i] == cy && xs[i] > cx) {
                        ok = true
                        dist = xs[i] - cx
                    }
                } else if (dir == 2) {
                    if (xs[i] == cx && ys[i] < cy) {
                        ok = true
                        dist = cy - ys[i]
                    }
                } else {
                    if (ys[i] == cy && xs[i] < cx) {
                        ok = true
                        dist = cx - xs[i]
                    }
                }
                if (ok && (ni < 0 || dist < nd)) {
                    ni = i
                    nd = dist
                }
            }
            i += 1
        }
        if (ni < 0) {
            return
        }
        visited[ni] = true
        dfs(ni, (dir + 3) % 4, cnt + 1)
        dfs(ni, (dir + 1) % 4, cnt + 1)
        visited[ni] = false
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let x0 = Int64.parse(head[0])
    let y0 = Int64.parse(head[1])
    let dr = head[2].toRuneArray()[0]
    var dir: Int64 = 0
    if (dr == r'U') {
        dir = 0
    } else if (dr == r'R') {
        dir = 1
    } else if (dr == r'D') {
        dir = 2
    } else {
        dir = 3
    }

    let xs = Array<Int64>(n + 1, { _ => 0 })
    let ys = Array<Int64>(n + 1, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        let q = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        xs[i] = Int64.parse(q[0])
        ys[i] = Int64.parse(q[1])
        i += 1
    }
    xs[n] = x0
    ys[n] = y0

    let s = Solver(xs, ys)
    s.dfs(n, dir, 0)
    println(s.best.toString())
}
```

</details>
